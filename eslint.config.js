import js from "@eslint/js";
import globals from "globals";
import reactPlugin from "eslint-plugin-react";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      "package.json",
      "package-lock.json",
      "*.json",
      "*.md",
      "public/**",
      "design/**",
      "node_modules/**",
      "dist/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        project: ["./tsconfig.json", "./tsconfig.node.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react: reactPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // React Recommended Rules
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs["jsx-runtime"].rules,

      // React Customizations
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/self-closing-comp": "warn",
      "react/no-unknown-property": "error",

      // TypeScript & Variables
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports" },
      ],

      // General Code Quality
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "warn",
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
    },
  },
  prettierConfig,
);
