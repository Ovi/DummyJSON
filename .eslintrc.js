module.exports = {
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'sort-keys': 0,
    'sort-vars': 1,
    'no-underscore-dangle': 0,
    'no-console': 2,
    'no-return-assign': 0,
    'consistent-return': 0,
    'func-names': 0,
    'no-use-before-define': 0,
    'no-plusplus': 0,
    'global-require': 0,
    'no-param-reassign': 0,
  },
  ignorePatterns: ['public/js', 'raw/', 'scripts/'],
};
