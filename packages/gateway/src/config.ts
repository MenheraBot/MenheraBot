export default () => {
  const { DISCORD_TOKEN, REST_AUTHORIZATION } = process.env;

  if (!DISCORD_TOKEN) {
    throw new Error('DISCORD_TOKEN is not defined');
  }

  if (!REST_AUTHORIZATION) {
    throw new Error('REST_AUTHORIZATION is not defined');
  }
  return { DISCORD_TOKEN, REST_AUTHORIZATION };
};
