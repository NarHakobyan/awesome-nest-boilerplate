const path = require('path');

module.exports = {
    'env': {
        'browser': true,
        'es6': true,
        'node': true,
    },
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        'project': path.resolve(__dirname, './tsconfig.eslint.json'),
        'sourceType': 'module',
    },
    extends: [
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'prettier/@typescript-eslint',
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ],
    'settings': {
        'import/parsers': { '@typescript-eslint/parser': ['.ts'] },
    },
    plugins: [
        'eslint-plugin-import',
        'eslint-plugin-import-helpers',
        '@typescript-eslint',
        '@typescript-eslint/tslint',
        'prettier',
        'simple-import-sort',
        'import',
    ],
    rules: {
        'simple-import-sort/sort': 'error',
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/no-unused-vars-experimental': [
            'error',
            { ignoredNamesRegex: '^_' }
        ],
        '@typescript-eslint/adjacent-overload-signatures': 'error',
        '@typescript-eslint/array-type': 'error',
        '@typescript-eslint/explicit-member-accessibility': [
            'off',
            {
                'overrides': {
                    'constructors': 'off',
                },
            },
        ],
        '@typescript-eslint/indent': 'off',
        '@typescript-eslint/consistent-type-definitions': 'error',
        '@typescript-eslint/member-delimiter-style': [
            'error',
            {
                'multiline': {
                    'delimiter': 'semi',
                    'requireLast': true,
                },
                'singleline': {
                    'delimiter': 'semi',
                    'requireLast': false,
                },
            },
        ],
        '@typescript-eslint/member-ordering': 'off',
        '@typescript-eslint/no-angle-bracket-type-assertion': 'off',
        '@typescript-eslint/no-empty-function': 'error',
        '@typescript-eslint/no-empty-interface': 'error',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-inferrable-types': 'error',
        '@typescript-eslint/no-misused-new': 'error',
        '@typescript-eslint/no-namespace': 'error',
        '@typescript-eslint/no-require-imports': 'error',
        '@typescript-eslint/no-this-alias': 'error',
        '@typescript-eslint/no-use-before-define': 'error',
        '@typescript-eslint/no-use-before-declare': 'off',
        '@typescript-eslint/no-var-requires': 'error',
        '@typescript-eslint/prefer-for-of': 'error',
        '@typescript-eslint/prefer-function-type': 'error',
        '@typescript-eslint/prefer-namespace-keyword': 'error',
        '@typescript-eslint/quotes': [
            'error',
            'single',
            {
                'avoidEscape': true,
            },
        ],
        '@typescript-eslint/semi': [
            'error',
            'always',
        ],
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/naming-convention': [
            'error',
            {
                "leadingUnderscore": "allow",
                selector: 'default', format: ['camelCase', 'PascalCase', 'snake_case', 'UPPER_CASE'],
            },
            {
                "leadingUnderscore": "allow",
                selector: 'variable',
                format: ['camelCase', 'UPPER_CASE'],
            },
            {
                selector: 'interface',
                format: ['PascalCase'],
                prefix: ['I'],
            },
            {
                selector: 'typeLike',
                format: ['PascalCase'],
            },
            {
                selector: 'memberLike',
                modifiers: ['private'],
                format: ['camelCase'],
            },
            {
                selector: 'variable',
                types: ['boolean'],
                format: ['PascalCase'],
                prefix: ['is', 'should', 'has', 'can', 'did', 'will'],
            },
        ],
        '@typescript-eslint/type-annotation-spacing': 'error',
        '@typescript-eslint/unified-signatures': 'error',
        'no-restricted-imports': [
            'error',
            {
                paths: [
                    {
                        name: 'rxjs/Rx',
                        message: 'Please import directly from \'rxjs\' instead',
                    },
                ],
            },
        ],
        '@typescript-eslint/ban-types': ['error', {
            'types': {
                'String': {
                    'message': 'Use string instead',
                    'fixWith': 'string',
                },
                '{}': {
                    'message': 'Use Record<K, V> instead',
                    'fixWith': 'Record<K, V>',
                },
                'object': {
                    'message': 'Use Record<K, V> instead',
                    'fixWith': 'Record<K, V>',
                },
            },
        }],
        '@typescript-eslint/interface-name-prefix': 'off',

        'no-restricted-syntax': [
            'error',
            {
                selector:
                    'CallExpression[callee.object.name=\'console\'][callee.property.name=/^(debug|log|time|timeEnd|trace)$/]',
                message: 'Unexpected property on console object was called',
            },
        ],

        '@typescript-eslint/no-non-null-assertion': 'error',
        'object-curly-spacing': [
            'error',
            'always',
        ],
        'no-multi-spaces': [
            'error',
        ],
        'arrow-body-style': 'error',
        'constructor-super': 'error',
        'curly': 'error',
        'dot-notation': 'error',
        'eol-last': 'error',
        'eqeqeq': [
            'error',
            'smart',
        ],
        'guard-for-in': 'error',
        'id-match': 'error',
        'import/no-default-export': 'error',
        'import/no-deprecated': 'warn',
        'import/no-internal-modules': 'off',
        'import/order': 'off',
        'max-classes-per-file': [
            'error',
            1,
        ],
        'max-len': [
            'error',
            {
                'code': 150,
            },
        ],
        'new-parens': 'error',
        'no-bitwise': 'error',
        'no-caller': 'error',
        'no-cond-assign': 'error',
        'no-debugger': 'error',
        'no-duplicate-case': 'error',
        'no-duplicate-imports': 'error',
        'no-empty': 'error',
        'no-eval': 'error',
        'no-extra-bind': 'error',
        'no-fallthrough': 'error',
        'no-invalid-this': 'error',
        'no-irregular-whitespace': 'error',
        'no-multiple-empty-lines': [
            'error',
            {
                'max': 1,
            },
        ],
        'no-new-func': 'error',
        'no-new-wrappers': 'error',
        'no-redeclare': 'error',
        'no-return-await': 'error',
        'no-sequences': 'error',
        'no-sparse-arrays': 'error',
        'no-template-curly-in-string': 'error',
        'no-shadow': [
            'error',
            {
                'hoist': 'all',
            },
        ],
        'no-throw-literal': 'error',
        'no-trailing-spaces': 'error',
        'no-undef-init': 'error',
        'no-unsafe-finally': 'error',
        'no-unused-expressions': 'error',
        'no-unused-labels': 'error',
        'no-var': 'error',
        'object-shorthand': 'error',
        'prefer-const': 'error',
        'prefer-object-spread': 'error',
        'quote-props': [
            'error',
            'consistent-as-needed',
        ],
        'radix': 'error',
        'use-isnan': 'error',
        'valid-typeof': 'off',
        '@typescript-eslint/tslint/config': [
            'error',
            {
                'rulesDirectory': [
                    './node_modules/tslint-eslint-rules/dist/rules',
                    './node_modules/tslint-config-prettier/lib',
                    './node_modules/tslint-consistent-codestyle/rules',
                ],
                'rules': {
                    'align': [
                        true,
                        'parameters',
                        'statements',
                        'members',
                    ],
                    'comment-format': [
                        true,
                        'check-space',
                    ],
                    'import-spacing': true,
                    'jsdoc-format': [
                        true,
                        'check-multiline-start',
                    ],
                    'naming-convention': [
                        true,
                        {
                            'leadingUnderscore': 'optional',
                            'type': 'default',
                            'format': 'camelCase',
                        },
                        {
                            'type': 'variable',
                            'modifiers': [
                                'global',
                                'const',
                            ],
                            'format': [
                                'camelCase',
                                'PascalCase',
                                'UPPER_CASE',
                            ],
                        },
                        {
                            'type': 'parameter',
                            'modifiers': 'unused',
                        },
                        {
                            'type': 'member',
                            'modifiers': 'private',
                        },
                        {
                            'type': 'member',
                            'modifiers': 'protected',
                        },
                        {
                            'type': 'property',
                            'modifiers': [
                                'public',
                                'static',
                                'const',
                            ],
                            'format': 'UPPER_CASE',
                        },
                        {
                            'type': 'type',
                            'format': 'PascalCase',
                        },
                        {
                            'type': 'interface',
                            'prefix': 'I',
                        },
                        {
                            'type': 'genericTypeParameter',
                            'regex': '^[A-Z]$',
                        },
                        {
                            'type': 'enumMember',
                            'format': 'UPPER_CASE',
                        },
                    ],
                    'no-accessor-recursion': true,
                    'no-collapsible-if': true,
                    'no-implicit-dependencies': [true, 'dev'],
                    'no-multi-spaces': true,
                    'no-reference-import': true,
                    'no-return-undefined': [
                        true,
                        'allow-void-expression',
                    ],
                    'no-unnecessary-callback-wrapper': true,
                    'no-unnecessary-else': true,
                    'no-unnecessary-type-annotation': true,
                    'no-var-before-return': true,
                    'number-literal-format': true,
                    'object-shorthand-properties-first': true,
                    'one-line': [
                        true,
                        'check-open-brace',
                        'check-catch',
                        'check-else',
                        'check-finally',
                        'check-whitespace',
                    ],
                    'parameter-properties': [
                        true,
                        'leading',
                        'member-access',
                    ],
                    'prefer-conditional-expression': true,
                    'prefer-const-enum': true,
                    'prefer-switch': [
                        true,
                        {
                            'min-cases': 3,
                        },
                    ],
                    'prefer-while': true,
                    'switch-final-break': true,
                    'trailing-comma': [
                        true,
                        {
                            'singleline': 'never',
                            'multiline': 'always',
                        },
                    ],
                    'whitespace': [
                        true,
                        'check-branch',
                        'check-decl',
                        'check-operator',
                        'check-separator',
                        'check-type',
                        'check-type-operator',
                        'check-rest-spread',
                    ],
                },
            },
        ],
    },
};
