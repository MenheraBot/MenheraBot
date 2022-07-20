const getEnviroments = () => {
  const {
    REST_SOCKET_PATH,
    DISCORD_TOKEN,
    REST_AUTHORIZATION,
    EVENT_SOCKET_PATH,
    DISCORD_APPLICATION_ID,
  } = process.env;

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

  if (!DISCORD_APPLICATION_ID) {
    throw new Error('DISCORD_APPLICATION_ID is not defined');
  }

  return {
    REST_SOCKET_PATH,
    DISCORD_TOKEN,
    REST_AUTHORIZATION,
    EVENT_SOCKET_PATH,
    DISCORD_APPLICATION_ID: BigInt(DISCORD_APPLICATION_ID),
  };
};

export { getEnviroments };
