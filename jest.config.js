/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  collectCoverageFrom: ['<rootDir>/src/**/*.ts', '!<rootDir>/src/main/**'],
  testEnvironment: 'node',
  preset: 'ts-jest',
};
