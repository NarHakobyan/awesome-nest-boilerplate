// eslint-disable-next-line @typescript-eslint/naming-convention
export interface LangchainModuleOptions {
  openAIKey: string;
  langchain?: {
    apiKey: string;
    tracingV2: string;
  };
}
