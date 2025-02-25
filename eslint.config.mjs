import { eslintConfig as common } from '@gewis/eslint-config-typescript';
import { eslintConfig as prettier } from '@gewis/prettier-config';

export default [
  ...common,
  // TODO should move to eslint-config-typescript
  {
    rules: {
      "import/no-named-as-default-member": "off"
    }
  },
  prettier
];
