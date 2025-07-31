// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...storybook.configs["flat/recommended"],
  {
    rules: {
      // Enforce functional programming principles
      "no-var": "error",
      "prefer-const": "error",
      "no-param-reassign": "error",
      "prefer-destructuring": "warn",
      "prefer-template": "warn",
      "object-shorthand": "warn",
      "arrow-body-style": ["warn", "as-needed"],
      // TypeScript specific rules
      "@typescript-eslint/consistent-type-imports": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { "argsIgnorePattern": "^_" }
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      // React specific rules
      "react/function-component-definition": [
        "warn",
        {
          "namedComponents": "arrow-function",
          "unnamedComponents": "arrow-function"
        }
      ],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    }
  }
];

export default eslintConfig;
