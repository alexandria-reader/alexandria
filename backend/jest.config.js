/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src/tests'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/src/tests/unit/'],
  transform: {
    '^.+\\.ts$': ['@swc/jest'],
  },
  moduleNameMapper: {
    '^@alexandria/shared$': '<rootDir>/../shared/src',
  },
};
