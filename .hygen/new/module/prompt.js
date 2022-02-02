const _ = require('lodash');

module.exports = [
  {
    type: 'input',
    name: 'name',
    message: 'Name:',
    validate(value) {
      if (!value.length) {
        return 'Module must have a name.';
      }
      return true;
    },
  },
  {
    type: 'MultiSelect',
    name: 'blocks',
    message: 'Blocks:',
    initial: ['Controller', 'Service', 'Entity', 'Repository', 'TranslationEntity'],
    choices: [
      {
        name: 'Controller',
        value: 'controller',
      },
      {
        name: 'service',
        value: 'template',
      },
      {
        name: 'Entity',
        value: 'entity',
      },
      {
        name: 'Repository',
        value: 'repository',
      },
      {
        name: 'TranslationEntity',
        value: 'translationEntity',
      },
    ],
    validate(value) {
      return true;
    },
  },
];
