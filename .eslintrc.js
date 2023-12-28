module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    amd: true, // eslint registers globals for define and require
  },
  extends: 'eslint:recommended',
  overrides: [],
  plugins: [
    'requirejs', // Require JS because of the dependencies
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'max-len': ['error', 120], // Max length
    'semi': ['error', 'always'], // Always semi-colon
    'space-before-function-paren': ['warn', 'always'], // Space before function paren
    // 'space-in-parens': [1, 'always'], // Space inside parens
    'quotes': [2, 'avoid-escape', 'single'],
    // RequireJS integration
    'requirejs/no-invalid-define': 2,
    'requirejs/no-multiple-define': 2,
    'requirejs/no-named-define': 0, // Default is 2 but our use of define caused errors
    'requirejs/no-commonjs-wrapper': 2,
    'requirejs/no-object-define': 1    
  },
};
