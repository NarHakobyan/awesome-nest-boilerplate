import type { CallbackManagerForToolRun } from '@langchain/core/callbacks/manager';
import type { BaseLanguageModel } from '@langchain/core/language_models/base';
import type { BaseLLM } from '@langchain/core/language_models/llms';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import type { ToolParams } from '@langchain/core/tools';
import { Tool } from '@langchain/core/tools';
import { google } from 'googleapis';

const getTimezoneOffsetInHours = () => {
  const offsetInMinutes = new Date().getTimezoneOffset();

  const offset = -offsetInMinutes / 60;

  return offset > 0
    ? `+${offset}`
    : `${offset}`;
};

export class GoogleCalendarViewTool extends Tool {
  private readonly accessToken: string;

  private readonly clientId: string;

  private readonly clientSecret: string;

  private readonly redirectUri: string;

  private readonly refreshToken: string;

  model: BaseLanguageModel;

  name = 'google_calendar_view';

  description = `A tool for retrieving Google Calendar events and meetings.
INPUT examples:
"action": "google_calendar_view",
"action_input": "display meetings for today"

"action": "google_calendar_view",
"action_input": "show events for tomorrow"

"action": "google_calendar_view",
"action_input": "display meetings for tomorrow between 4pm and 8pm"

"action": "google_calendar_view",
"action_input": "display meetings for 05/05/2023"

action": "google_calendar_view",
"action_input": "display meetings for 05/05/2023 between 4pm and 8pm"

OUTPUT:
- title, start time, end time, attendees, description (if available)
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
    const calendar = this.getCalendar();
    const model = this.model;

    const prompt = new PromptTemplate({
      template: `
Date format: YYYY-MM-DDThh:mm:ss+00:00
Based on this event description: 'View my events on Thursday',
output a json of the following parameters:
Today's datetime on UTC time 2023-05-02T10:00:00+00:00, it's Tuesday and timezone
of the user is -5, take into account the timezone of the user and today's date.
If the user is searching for events with a specific title, person or location, put it into the search_query parameter.
1. time_min
2. time_max
3. user_timezone
4. max_results
5. search_query
event_summary:
{{
    "time_min": "2023-05-04T00:00:00-05:00",
    "time_max": "2023-05-04T23:59:59-05:00",
    "user_timezone": "America/New_York",
    "max_results": 10,
    "search_query": ""
}}

Date format: YYYY-MM-DDThh:mm:ss+00:00
Based on this event description: '{query}', output a json of the
following parameters:
Today's datetime on UTC time {date}, today it's {dayName} and timezone of the user {u_timezone},
take into account the timezone of the user and today's date.
If the user is searching for events with a specific title, person or location, put it into the search_query parameter.
1. time_min
2. time_max
3. user_timezone
4. max_results
5. search_query
event_summary:
`,
      inputVariables: ['date', 'query', 'u_timezone', 'dayName'],
    });

    const viewEventsChain = prompt.pipe(model).pipe(new StringOutputParser());

    const date = new Date().toISOString();
    const u_timezone = getTimezoneOffsetInHours();
    const dayName = new Date().toLocaleString('en-us', { weekday: 'long' });

    const output = await viewEventsChain.invoke(
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
      const response = await calendar.events.list({
        calendarId: 'primary',
        ...loaded,
      });

      const curatedItems = response.data.items
        ? response.data.items.map(
            ({
              status,
              summary,
              description,
              start,
              end,
            }) => ({
              status,
              summary,
              description,
              start,
              end,
            }),
          )
        : [];

      return `Result for the prompt "${query}": \n${JSON.stringify(
        curatedItems,
        null,
        2,
      )}`;
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
    // oauth2Client.setCredentials({
    //   access_token: this.accessToken,
    //   refresh_token: this.refreshToken,
    // });

    return google.calendar({
      version: 'v3',
      auth: oauth2Client,
    });
  }

  getModel() {
    return this.model;
  }
}
