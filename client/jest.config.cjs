module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    // Mock CSS/assets imports which crash Jest
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/src/__mocks__/fileMock.js',
    '^react-router-dom$': '<rootDir>/src/__mocks__/reactRouterDomMock.js',
    '^framer-motion$': '<rootDir>/src/__mocks__/framerMotionMock.js',
    '^react-hot-toast$': '<rootDir>/src/__mocks__/reactHotToastMock.js',
    '^lucide-react$': '<rootDir>/src/__mocks__/lucideReactMock.js'
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text', 'html'],
  testMatch: ['<rootDir>/src/**/*.test.(js|jsx)'],
};
