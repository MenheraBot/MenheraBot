import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  verbose: true,
  projects: [
    {
      transform: {
        ...tsJestTransformCfg,
        '^.+\\.[t]sx?$': [
          "ts-jest", {
            "useESM": true,
          }
        ]
      },
      testEnvironment: 'node',
      displayName: '@menherabot/events',
      setupFiles: ['./test/setupTests.ts'],
      testMatch: ['<rootDir>/**/?(*.)+(spec|test).ts?(x)'],
      rootDir: './packages/events',
      modulePathIgnorePatterns: ["<rootDir>/dist/"],
      preset: 'ts-jest/presets/default-esm',
      extensionsToTreatAsEsm: ['.ts'],
      moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
    }
  ]
};
