// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Read .gitignore and convert to ESLint ignore patterns
const gitignoreToEslintIgnores = (gitignorePath) => {
  try {
    const gitignoreContent = readFileSync(gitignorePath, 'utf8');
    const patterns = gitignoreContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(line => {
        // Remove leading slash and add ** for directories
        const pattern = line.startsWith('/') ? line.slice(1) : line;
        return pattern.endsWith('/') ? `${pattern}**` : pattern;
      });
    return patterns;
  } catch (error) {
    console.warn('Could not read .gitignore file:', error.message);
    return [];
  }
};

const gitignorePatterns = gitignoreToEslintIgnores('.gitignore');

const eslintConfig = [
  {
    ignores: gitignorePatterns
  },
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
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      // React specific rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    }
  }
];

export default eslintConfig;
