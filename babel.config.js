module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      }],
    '@babel/preset-typescript',
  ],
  overrides: [
    {
      test: ['./src/**/*.ts'],
      presets: [
        '@babel/preset-typescript',
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current',
            },
          },
        ],
      ],
    },
  ],
  plugins: [
    ['module-resolver', {
      alias: {
        '@structures': './src/structures',
      },
    }],
  ],
  ignore: [
    '**/*.spec.ts',
  ],
};
