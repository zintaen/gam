import { mergeConfigs } from '@cyberskill/shared/config';

export default mergeConfigs('eslint', {
    rules: {
        'node/prefer-global/process': 'off',
        'react/no-array-index-key': 'off',
        'react-hooks-extra/no-direct-set-state-in-use-effect': 'off',
        'no-template-curly-in-string': 'off',
    },
});
