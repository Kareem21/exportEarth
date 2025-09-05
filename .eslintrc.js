module.exports = {
  "plugins": ['@typescript-eslint'],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  rules: {
    eqeqeq: 0, // Must use strict equality
    'no-unused-vars': 1, // No unused variables or parameters after declaration
    'no-throw-literal': 0, // 0 allowed/2 not allowed - throw literal errors throw "error";
    'no-sparse-arrays': 2, // Arrays cannot have empty positions
    'no-empty': 0, // Prohibit empty statement blocks
    'no-console': ['error', { allow: ['warn', 'error', 'info', "log"] }],
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-useless-escape': 0,
    "@typescript-eslint/no-explicit-any": "off",
    "no-async-promise-executor": 0
  },
}
