module.exports = {
  collectCoverageFrom: ["tests/**/*.{js,jsx,mjs}"],
  testMatch: [
    "<rootDir>/tests/**/__tests__/**/*.{js,jsx,mjs}",
    "<rootDir>/tests/**/?(*.)(spec|test).{js,jsx,mjs}"
  ],
  transform: {
    "^.+\\.(js|jsx|mjs)$": "<rootDir>/tests/jest-transformer.js"
  },
  transformIgnorePatterns: ["[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs)$"]
};
