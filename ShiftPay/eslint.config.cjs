const js = require('@eslint/js');
const pluginVue = require('eslint-plugin-vue');

const {
    withVueTs,
    vueTsConfigs,
} = require('@vue/eslint-config-typescript');

const skipFormattingConfig = require(
    '@vue/eslint-config-prettier/skip-formatting',
);

module.exports = withVueTs(
    {
        name: 'shiftpay/ignores',

        ignores: [
            'dist/**',
            'coverage/**',
            '.vite/**',
            'node_modules/**',
            'eslint.config.cjs'
        ],
    },

    js.configs.recommended,

    pluginVue.configs['flat/essential'],

    vueTsConfigs.recommended,

    {
        name: 'shiftpay/project-rules',

        rules: {
            '@typescript-eslint/no-explicit-any': 'warn',
        },
    },

    {
        name: 'shiftpay/options',

        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
    },

    // Keep this last so it disables formatting rules
    // that conflict with Prettier.
    skipFormattingConfig,
);