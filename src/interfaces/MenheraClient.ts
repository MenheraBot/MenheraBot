/* eslint-disable camelcase */
export interface MenheraConfig {
  commandsDirectory: string;
  sentry_dns: string;
  eventsDirectory: string;
  token: string;
  uri: string;
  owner: string[];
  prefix: string;
  testToken: string;
  dbt: string;
  webhookAuth: string;
  webhookPort: string;
  api_IP: string;
  api_TOKEN: string;
  bug_webhook_token: string;
  bug_webhook_id: string;
  suggest_webhook_token: string;
  suggest_webhook_id: string;
  guild_webhook_token: string;
  guild_webhook_id: string;
  family_webhook_token: string;
  family_webhook_id: string;
}
