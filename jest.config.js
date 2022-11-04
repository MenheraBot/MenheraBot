/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    "preset": "ts-jest/presets/default-esm",
    "globals": {
      "ts-jest": {
        "useESM": true
      }
    }
};
