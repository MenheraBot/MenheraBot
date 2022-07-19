export default () => {
  const { DISCORD_TOKEN, REST_AUTHORIZATION, EVENT_HANDLER_SOCKET_PATH, REST_SOCKET_PATH } =
    process.env;

  if (!DISCORD_TOKEN) {
    throw new Error('DISCORD_TOKEN is not defined');
  }

  if (!REST_AUTHORIZATION) {
    throw new Error('REST_AUTHORIZATION is not defined');
  }

  if (!EVENT_HANDLER_SOCKET_PATH) {
    throw new Error('EVENT_HANDLER_SOCKET_PATH is not defined');
  }

  if (!REST_SOCKET_PATH) {
    throw new Error('SOCKET_PATH is not defined');
  }

  return {
    DISCORD_TOKEN,
    REST_AUTHORIZATION,
    REST_SOCKET_PATH,
    EVENT_HANDLER_SOCKET_PATH,
  };
};
