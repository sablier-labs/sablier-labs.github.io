const baseConfig = require("@sablier/devkit/prettier");

/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  ...baseConfig,
  plugins: ["@prettier/plugin-xml"],
};

module.exports = config;
