// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    rules: {
      "import/no-named-as-default-member": "off",
      "import/no-named-as-default": "off",
      "react/no-unescaped-entities": "off",
    },
    ignores: ["dist/*"],
  },
]);
