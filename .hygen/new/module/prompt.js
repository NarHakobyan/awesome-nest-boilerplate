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
    initial: ['<script>', '<template>', '<style>'],
    choices: [
      {
        name: '<script>',
        value: 'script',
      },
      {
        name: '<template>',
        value: 'template',
      },
      {
        name: '<style>',
        value: 'style',
      },
    ],
    validate(value) {
      if (value.indexOf('<script>') === -1 && value.indexOf('<template>') === -1) {
        return 'Components require at least a <script> or <template> tag.';
      }
      return true;
    },
  },
];
