export default () => {
  const { DISCORD_TOKEN, REST_AUTHORIZATION, SOCKET_PATH } = process.env;

  if (!DISCORD_TOKEN) {
    throw new Error('DISCORD_TOKEN is not defined');
  }

  if (!REST_AUTHORIZATION) {
    throw new Error('REST_AUTHORIZATION is not defined');
  }

  if (!SOCKET_PATH) {
    throw new Error('SOCKET_PATH is not defined');
  }

  return { DISCORD_TOKEN, REST_AUTHORIZATION, SOCKET_PATH };
};
