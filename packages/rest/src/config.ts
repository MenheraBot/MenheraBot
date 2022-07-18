export default () => {
  const { DISCORD_TOKEN, REST_AUTHORIZATION, REST_PORT } = process.env;

  if (!DISCORD_TOKEN) {
    throw new Error('DISCORD_TOKEN is not defined');
  }

  if (!REST_AUTHORIZATION) {
    throw new Error('REST_AUTHORIZATION is not defined');
  }

  if (!REST_PORT) {
    throw new Error('REST_PORT is not defined');
  }

  return { DISCORD_TOKEN, REST_AUTHORIZATION, REST_PORT: Number(REST_PORT) };
};
