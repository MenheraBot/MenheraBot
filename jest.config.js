/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  verbose: true,
  projects: [
    {
      preset: "ts-jest/presets/default-esm",
      testEnvironment: 'node',
      displayName: '@menherabot/events',
      setupFiles: ['./packages/events/test/setupTests.ts'],
      testMatch:['<rootDir>/packages/events/**/?(*.)+(spec|test).ts?(x)'],
      modulePathIgnorePatterns: ["<rootDir>/dist/"],
      transform: {
        '^.+\\.[t]sx?$': [
          "ts-jest", {
            "useESM": true
          }
        ]
      },
    }
  ]
};
