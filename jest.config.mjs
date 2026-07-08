/** @type {import('jest').Config} */
export default {
  verbose: true,
  projects: [
    {
      displayName: '@menherabot/events',
      rootDir: './packages/events',
      testEnvironment: 'node',
      // The preset handles the heavy lifting for extensions and basic ESM setup
      preset: 'ts-jest/presets/default-esm',
      extensionsToTreatAsEsm: ['.ts'],
      setupFiles: ['./test/setupTests.ts'],
      testMatch: ['<rootDir>/**/?(*.)+(spec|test).ts?(x)'],
      modulePathIgnorePatterns: ['<rootDir>/dist/'],
      moduleNameMapper: {
        // This is crucial for ESM so it maps your .js imports back to .ts files in tests
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
      transform: {
        // We only transform TS files, and we force TS to output modern ESM
        '^.+\\.tsx?$': [
          'ts-jest',
          {
            useESM: true,
            tsconfig: {
              module: 'ESNext',
              moduleResolution: 'NodeNext',
              esModuleInterop: true,
              allowJs: true,
            },
          },
        ],
      },
    },
  ],
};
