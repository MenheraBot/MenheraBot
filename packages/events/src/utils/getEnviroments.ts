const getEnviroments = <Key extends string>(variables: Key[]): Record<Key, string> => {
  const fromEnv = variables.reduce<Record<Key, string>>(
    (envs, key) => {
      const val = process.env[key] as string | undefined;

      if (!val) throw new Error(`${key} was not found as an environment variable`);

      envs[key] = val;

      return envs;
    },
    {} as Record<Key, string>,
  );

  return fromEnv;
};

const devEnviroment = process.env.NODE_ENV === 'development';
const prodEnviroment = process.env.NODE_ENV === 'production';
const testEnviroment = process.env.NODE_ENV === 'test';

export { getEnviroments, devEnviroment, prodEnviroment, testEnviroment };
