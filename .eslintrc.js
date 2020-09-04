module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
  },
  plugins: [
    "@typescript-eslint",
  ],
  ignorePatterns: [
    "**/*.js",
    "!.eslintrc.js",
    "**/*.d.ts",
  ],
  rules: {
    indent: 0,
    "@typescript-eslint/indent": [
      "error",
      2,
      {
        SwitchCase: 1,
        FunctionDeclaration: {
          parameters: "first",
        },
        FunctionExpression: {
          parameters: "first",
        },
        CallExpression: {
          arguments: "first",
        },
        // ignoreComments: true,
        ignoredNodes: [
          // https://github.com/typescript-eslint/typescript-eslint/issues/1824
        ],
      },
    ],
    "no-multi-spaces": ["error", {
      // ignoreEOLComments: true,
    }],
    "array-bracket-spacing": ["error", "never"],
    "comma-spacing": 0,
    "@typescript-eslint/comma-spacing": ["error", {
      before: false,
      after: true,
    }],
    "func-call-spacing": 0,
    "@typescript-eslint/func-call-spacing": ["error", "never"],
    "key-spacing": ["error"],
    "keyword-spacing": 0,
    "@typescript-eslint/keyword-spacing": ["error"],
    "object-curly-spacing": 0,
    "@typescript-eslint/object-curly-spacing": ["error", "always"],
    "object-property-newline": ["error", {
      allowAllPropertiesOnSameLine: true,
    }],
    // "linebreak-style": ["error", "unix"],
    "brace-style": 0,
    "@typescript-eslint/brace-style": ["error", "stroustrup"],
    quotes: 0,
    "@typescript-eslint/quotes": ["error", "double"],
    semi: 0,
    "@typescript-eslint/semi": ["error", "always"],
    "no-debugger": ["warn"],
    "no-tabs": ["error"],
    "no-trailing-spaces": ["error"],
    "comma-dangle": 0,
    "@typescript-eslint/comma-dangle": ["error", "always-multiline"],
    "eol-last": ["error"],
    "generator-star-spacing": ["error", "after"],
    "function-paren-newline": ["error", "multiline"],
    "prefer-const": [
      "error",
      {
        destructuring: "all",
        ignoreReadBeforeAssign: false,
      },
    ],
    "template-curly-spacing": ["error", "never"],
    "semi-spacing": ["error"],
    "space-before-blocks": ["error", "always"],
    "space-before-function-paren": 0,
    "@typescript-eslint/space-before-function-paren": ["error", {
      anonymous: "always",
      named: "never",
      asyncArrow: "always",
    }],
    "spaced-comment": ["error", "always"],
    "space-in-parens": ["error", "never"],
    "space-infix-ops": 0,
    "@typescript-eslint/space-infix-ops": ["error"],
    "space-unary-ops": ["error", {
      words: true,
      nonwords: false,
    }],
    "switch-colon-spacing": ["error"],
    "template-tag-spacing": ["error", "never"],
    "quote-props": ["error", "as-needed"],
    "prefer-object-spread": ["error"],
    "prefer-promise-reject-errors": ["error"],
    "prefer-rest-params": ["error"],
    "prefer-spread": ["error"],
    "prefer-template": ["error"],
    "new-parens": ["error", "always"],
    // "no-bitwise": ["warn"],
    "no-restricted-syntax": ["error", "WithStatement"],
    "no-inner-declarations": 0,
    "no-mixed-operators": ["error"],
    "no-whitespace-before-property": ["error"],
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/explicit-module-boundary-types": 0,
    "@typescript-eslint/no-namespace": 0,
    "@typescript-eslint/no-non-null-assertion": 0,
    "@typescript-eslint/no-unused-vars": 0,
    "@typescript-eslint/no-inferrable-types": 0,
    "@typescript-eslint/triple-slash-reference": 0,
    "@typescript-eslint/type-annotation-spacing": ["error", {
      before: false,
      after: true,
      overrides: {
        arrow: {
          before: true,
          after: true,
        },
      },
    }],
    "@typescript-eslint/member-delimiter-style": ["error", {
      multiline: {
        delimiter: "semi",
        requireLast: true,
      },
      singleline: {
        delimiter: "semi",
        requireLast: true,
      },
    }],
    "@typescript-eslint/ban-types": 0,
  },
  overrides: [
    {
      files: ["*.js"],
      rules: {
        "@typescript-eslint/no-var-requires": 0,
      },
    },
    {
      files: ["*.ts"],
      parserOptions: {
        project: [
          "./tsconfig.json",
          "./tests/tsconfig.json",
        ],
      },
      rules: {
        "@typescript-eslint/await-thenable": "error",
        "@typescript-eslint/no-var-requires": ["warn"],
        // "@typescript-eslint/prefer-enum-initializers": "error",
        "@typescript-eslint/prefer-for-of": "error",
        "@typescript-eslint/prefer-includes": "error",
        "@typescript-eslint/prefer-function-type": "error",
        // "@typescript-eslint/prefer-nullish-coalescing": "error",
        "@typescript-eslint/prefer-optional-chain": "error",
        "@typescript-eslint/prefer-string-starts-ends-with": "error",
      },
    },
  ],
};
