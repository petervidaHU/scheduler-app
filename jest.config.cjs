/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  roots: ['<rootDir>/app', '<rootDir>/tests'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.jest.json',
      },
    ],
  },
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/app/$1',
  },
  coverageThreshold: {
    'app/components/admin/AdminEntityCard.tsx': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    'app/components/admin/AdminClientComponent.tsx': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    'app/components/LocaleSwitcher.tsx': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    'app/ui/ColorSchemeToggle.tsx': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
