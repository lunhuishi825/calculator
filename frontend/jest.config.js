const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // 指向Next.js应用的路径
  dir: "./",
});

// Jest配置
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    // 处理模块别名
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)",
  ],
};

// createJestConfig会自动将Next.js所需的配置传递给Jest
module.exports = createJestConfig(customJestConfig);
