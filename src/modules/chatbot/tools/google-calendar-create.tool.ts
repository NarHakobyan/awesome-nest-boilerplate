import type { CallbackManagerForToolRun } from '@langchain/core/callbacks/manager';
import type { BaseLanguageModel } from '@langchain/core/language_models/base';
import type { BaseLLM } from '@langchain/core/language_models/llms';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import type { ToolParams } from '@langchain/core/tools';
import { Tool } from '@langchain/core/tools';
import { google, calendar_v3 } from 'googleapis';

interface CreateEventParams {
  eventSummary: string;
  eventStartTime: string;
  eventEndTime: string;
  userTimezone: string;
  attendees?: string[];
  eventLocation?: string;
  eventDescription?: string;
}

const getTimezoneOffsetInHours = () => {
  const offsetInMinutes = new Date().getTimezoneOffset();

  const offset = -offsetInMinutes / 60;

  return offset > 0 ? `+${offset}` : `${offset}`;
};

export class GoogleCalendarCreateTool extends Tool {
  private readonly accessToken: string;

  private readonly clientId: string;

  private readonly clientSecret: string;

  private readonly redirectUri: string;

  private readonly refreshToken: string;

  model: BaseLanguageModel;

  name = 'google_calendar_create';

  description = `A tool for creating Google Calendar events and meetings.

INPUT example:
"action": "google_calendar_create",
"action_input": "create a new meeting with John Doe tomorrow at 4pm and John as an attendee with email john@mail.com"

OUTPUT:
Output is a confirmation of a created event.
`;

  constructor(
    config: ToolParams & {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
      accessToken: string;
      refreshToken: string;
      model: BaseLLM;
    },
  ) {
    super(config);
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
    this.accessToken = config.accessToken;
    this.refreshToken = config.refreshToken;
    this.model = config.model;
  }

  async _call(query: string, runManager?: CallbackManagerForToolRun) {
    const model = this.model;

    const prompt = new PromptTemplate({
      template: `
Date format: YYYY-MM-DDThh:mm:ss+00:00
Based on this event description: "Joey birthday tomorrow at 7 pm",
output a json of the following parameters:
Today's datetime on UTC time 2023-05-02T10:00:00+00:00, it's Tuesday and timezone
of the user is -5, take into account the timezone of the user and today's date.
1. event_summary
2. event_start_time
3. event_end_time
4. event_location
5. event_description
6. user_timezone
7. attendees
event_summary:
{{
    "event_summary": "Joey birthday",
    "event_start_time": "2023-05-03T19:00:00-05:00",
    "event_end_time": "2023-05-03T20:00:00-05:00",
    "event_location": "",
    "event_description": "",
    "user_timezone": "America/New_York",
    "attendees": ["joey@mail.com"]
}}

Date format: YYYY-MM-DDThh:mm:ss+00:00
Based on this event description: "Create a meeting for 5 pm on Saturday with Joey",
output a json of the following parameters:
Today's datetime on UTC time 2023-05-04T10:00:00+00:00, it's Thursday and timezone
of the user is -5, take into account the timezone of the user and today's date.
1. event_summary
2. event_start_time
3. event_end_time
4. event_location
5. event_description
6. user_timezone
7. attendees
event_summary:
{{
    "event_summary": "Meeting with Joey",
    "event_start_time": "2023-05-06T17:00:00-05:00",
    "event_end_time": "2023-05-06T18:00:00-05:00",
    "event_location": "",
    "event_description": "",
    "user_timezone": "America/New_York"
}}

Date format: YYYY-MM-DDThh:mm:ss+00:00
Based on this event description: "{query}", output a json of the
following parameters:
Today's datetime on UTC time {date}, it's {dayName} and timezone of the user {u_timezone},
take into account the timezone of the user and today's date.
1. event_summary
2. event_start_time
3. event_end_time
4. event_location
5. event_description
6. user_timezone
event_summary:
`,
      inputVariables: ['date', 'query', 'u_timezone', 'dayName'],
    });

    const createEventChain = prompt.pipe(model).pipe(new StringOutputParser());

    const date = new Date().toISOString();
    const u_timezone = getTimezoneOffsetInHours();
    const dayName = new Date().toLocaleString('en-us', { weekday: 'long' });

    const output = await createEventChain.invoke(
      {
        query,
        date,
        u_timezone,
        dayName,
      },
      runManager?.getChild(),
    );
    const loaded = JSON.parse(output);

    try {
      const [
        eventSummary,
        eventStartTime,
        eventEndTime,
        eventLocation,
        eventDescription,
        userTimezone,
        attendees,
      ] = Object.values<string>(loaded);

      if (!eventSummary || !eventStartTime || !eventEndTime || !userTimezone) {
        return 'Error: Please provide all the required parameters';
      }

      const event = await this.createEvent({
        eventSummary,
        eventStartTime,
        eventEndTime,
        userTimezone,
        eventLocation,
        eventDescription,
        attendees: attendees as string[] | undefined,
      });

      if (!(event as { error: string }).error) {
        return `Event created successfully, details: event ${(event as any).data.htmlLink}`;
      }

      return `An error occurred creating the event: ${
        (event as { error: string }).error
      }`;
    } catch (error) {
      return `An error occurred: ${error}`;
    }
  }

  private getCalendar() {
    const oauth2Client = new google.auth.OAuth2({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      redirectUri: this.redirectUri,
      credentials: {
        access_token: this.accessToken,
        refresh_token: this.refreshToken,
      },
    });

    return google.calendar({
      version: 'v3',
      auth: oauth2Client,
    });
  }

  getModel() {
    return this.model;
  }

  private async createEvent(param: CreateEventParams) {
    const calendar = this.getCalendar();
    const event: calendar_v3.Schema$Event = {
      summary: param.eventSummary,
      location: param.eventLocation,
      description: param.eventDescription,
      start: {
        dateTime: param.eventStartTime,
        timeZone: param.userTimezone,
      },
      end: {
        dateTime: param.eventEndTime,
        timeZone: param.userTimezone,
      },
      attendees: param.attendees?.map((email) => ({ email })),
    };

    try {
      return await calendar.events.insert({
        requestBody: event,
        calendarId: 'primary',
      });
    } catch (error) {
      return {
        error: `An error occurred: ${error}`,
      };
    }
  }
}
