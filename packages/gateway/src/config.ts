export default () => {
  const {
    DISCORD_TOKEN,
    REST_AUTHORIZATION,
    EVENT_HANDLER_PORT,
    EVENT_HANDLER_SECRET_KEY,
    EVENT_HANDLER_URL,
    REST_SOCKET_PATH,
  } = process.env;

  if (!DISCORD_TOKEN) {
    throw new Error('DISCORD_TOKEN is not defined');
  }

  if (!REST_AUTHORIZATION) {
    throw new Error('REST_AUTHORIZATION is not defined');
  }

  if (!EVENT_HANDLER_PORT) {
    throw new Error('EVENT_HANDLER_PORT is not defined');
  }

  if (!EVENT_HANDLER_SECRET_KEY) {
    throw new Error('EVENT_HANDLER_SECRET_KEY is not defined');
  }

  if (!EVENT_HANDLER_URL) {
    throw new Error('EVENT_HANDLER_URL is not defined');
  }

  if (!REST_SOCKET_PATH) {
    throw new Error('SOCKET_PATH is not defined');
  }

  return {
    DISCORD_TOKEN,
    REST_AUTHORIZATION,
    EVENT_HANDLER_PORT,
    EVENT_HANDLER_SECRET_KEY,
    EVENT_HANDLER_URL,
    REST_SOCKET_PATH,
  };
};
