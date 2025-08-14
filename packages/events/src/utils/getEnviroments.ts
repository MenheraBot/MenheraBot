const getEnviroments = <Key extends string>(variables: Key[]): Record<Key, string> => {
  const fromEnv = variables.reduce<Record<Key, string>>((envs, key) => {
    const val = process.env[key] as string | undefined;

    if (!val) throw new Error(`${key} was not found as an environment variable`);

    envs[key] = val;

    return envs;
  }, {} as Record<Key, string>);

  return fromEnv;
};

const PRODUCTION_ENVIROMENT = process.env.NODE_ENV === 'production';
const DEVELOPMENT_ENVIROMENT = process.env.NODE_ENV === 'development';
const TEST_ENVIROMENT = process.env.NODE_ENV === 'test';
const IGNORE_MICROSSERVICES = process.env.NOMICROSERVICES;

const chooseBasedOnEnv = <T extends unknown>(returnInProduction: T, returnInOtherEnvs: T): T =>
  PRODUCTION_ENVIROMENT ? returnInProduction : returnInOtherEnvs;

export {
  getEnviroments,
  chooseBasedOnEnv,
  DEVELOPMENT_ENVIROMENT,
  TEST_ENVIROMENT,
  PRODUCTION_ENVIROMENT,
  IGNORE_MICROSSERVICES,
};
