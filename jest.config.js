/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  verbose: true,
  projects: [
    {
      preset: "ts-jest/presets/default-esm",
      testEnvironment: 'node',
      displayName: '@menherabot/events',
      setupFiles: ['./test/setupTests.ts'],
      testMatch: ['<rootDir>/**/?(*.)+(spec|test).ts?(x)'],
      rootDir: './packages/events',
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
