module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    amd: true, // eslint registers globals for define and require
  },
  globals: {
    jQuery: true,
    $: true
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
    'max-len': ['error', 120], // Max length 120 chars in a line
    'quotes': ['warn', 'single'], // Single quotes ex: let a = 'a';
    'semi': ['error', 'always'], // Always semi-colon ex: let a = 1;
    'space-before-function-paren': ['warn', 'never'], // No space before function paren ex: function(a, b) { return a; }
    'space-in-parens': [1, 'never'], // No space inside parens ex: (a, b)
    'camelcase': ['warn', {'properties': 'never', 'ignoreDestructuring': true}], 
    // Camelcase but not for properties or destructuring
    // ex: let camelCase = {no_camel_case: 1}; let {no_camel_case} = object; function camelCase({no_camel_case}) { ... }
    'rest-spread-spacing': ['error', 'never'], // No space after spread operator ex: [...array]
    'no-unused-vars': ['error', {'args': 'none'}], // No unused vars except args ex: function(a, b) { return a; }
    'object-curly-spacing': ['warn', 'never'], // No space inside object curly braces ex: {one: 1, two: 2}
    'array-bracket-spacing': ['warn', 'never'], // No space inside array brackets ex: ['one', 'two']
    // RequireJS integration
    'requirejs/no-invalid-define': 2,
    'requirejs/no-multiple-define': 2,
    'requirejs/no-named-define': 0, // Default is 2 but our use of define caused errors
    'requirejs/no-commonjs-wrapper': 2,
    'requirejs/no-object-define': 1    
  },
};
