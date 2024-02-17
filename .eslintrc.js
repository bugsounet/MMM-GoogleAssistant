module.exports = {
  extends: ["eslint:recommended", "plugin:@stylistic/all-extends", "plugin:import/recommended"],
  env: {
    es2023: true,
    node: true
  },
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2023,
    ecmaFeatures: {
      globalReturn: true
    }
  },
  globals: {
    config: true,
    Log: true,
    MM: true,
    Module: true,
    moment: true,
    document: true
  },
  rules: {
    eqeqeq: "error",
    "import/order": "error",
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        json: "always" // ignore json require (display EXT version and rev date)
      }
    ],
    "import/newline-after-import": "error",
    "no-param-reassign": "error",
    "no-prototype-builtins": "off",
    "no-throw-literal": "error",
    "no-unused-vars": "off",
    "no-useless-return": "error",
    "object-shorthand": ["error", "methods"],
    "prefer-template": "error",
    "@stylistic/array-element-newline": ["error", "consistent"],
    "@stylistic/arrow-parens": ["error", "always"],
    "@stylistic/brace-style": "off",
    "@stylistic/comma-dangle": ["error", "never"],
    "@stylistic/dot-location": ["error", "property"],
    "@stylistic/function-call-argument-newline": ["error", "consistent"],
    "@stylistic/function-paren-newline": ["error", "consistent"],
    "@stylistic/implicit-arrow-linebreak": ["error", "beside"],
    "@stylistic/max-statements-per-line": ["error", { max: 2 }],
    "@stylistic/multiline-ternary": ["error", "always-multiline"],
    "@stylistic/newline-per-chained-call": ["error", { ignoreChainWithDepth: 4 }],
    "@stylistic/no-extra-parens": "off",
    "@stylistic/no-tabs": "off",
    "@stylistic/object-curly-spacing": ["error", "always"],
    "@stylistic/object-property-newline": ["error", { allowAllPropertiesOnSameLine: true }],
    "@stylistic/operator-linebreak": ["error", "before"],
    "@stylistic/padded-blocks": "off",
    "@stylistic/quote-props": ["error", "as-needed"],
    "@stylistic/quotes": ["error", "double"],
    "@stylistic/indent": ["error", 2], // indent 2 spaces
    "@stylistic/semi": ["error", "always"],
    "@stylistic/space-before-function-paren": ["error", "always"],
    "@stylistic/spaced-comment": "off"
  }
};
