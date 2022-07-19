export default () => {
  const { REST_SOCKET_PATH, DISCORD_TOKEN, REST_AUTHORIZATION, EVENT_SOCKET_PATH } = process.env;

  if (!REST_SOCKET_PATH) {
    throw new Error('SOCKET_PATH is not defined');
  }

  if (!DISCORD_TOKEN) {
    throw new Error('DISCORD_TOKEN is not defined');
  }

  if (!REST_AUTHORIZATION) {
    throw new Error('REST_AUTHORIZATION is not defined');
  }

  if (!EVENT_SOCKET_PATH) {
    throw new Error('EVENT_SOCKET_PATH is not defined');
  }

  return { REST_SOCKET_PATH, DISCORD_TOKEN, REST_AUTHORIZATION, EVENT_SOCKET_PATH };
};
