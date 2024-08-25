module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended",
    "standard",
  ],
  plugins: ["@typescript-eslint", "react", "prettier"],
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "commonjs",
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    "prettier/prettier": "error",
    "@typescript-eslint/no-var-requires": "off",
  },

  ignorePatterns: [
    ".babelrc.js",
    ".cache",
    "node_modules",
    ".eslintrc.js",
    "eslint.config.mjs",
  ],
};
