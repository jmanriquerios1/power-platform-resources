module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "./tsconfig.json" }]
  },
  moduleFileExtensions: ["ts", "tsx", "js"],
  testMatch: ["**/tests/**/*.test.ts"]
};
