import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./", // root of your Next.js app
});

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    // (optional) if you use CSS modules, images etc.
    "^.+\\.(css|scss|sass)$": "identity-obj-proxy",
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/e2e/",
  ],
};

export default createJestConfig(config);
