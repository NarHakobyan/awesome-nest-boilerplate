'use strict'

module.exports = {
  prompt: ({ prompter, args }) => {
    return prompter.prompt([
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
        initial: [
          'Controller',
          'CreateCommand',
          'CreateDTO',
          'DTO',
          'Entity',
          'GetQuery',
          //'Module',
          'NotFoundException',
          'PageOptionsDTO',
          'Repository',
          'Service',
          'TranslationDTO',
          'TranslationEntity',
          'TranslationRepository',
          'UpdateDTO'
        ],
        choices: [
          {
            name: 'Controller',
            value: 'controller',
          },
          {
            name: 'CreateCommand',
            value: 'create-command',
          },
          {
            name: 'CreateDTO',
            value: 'create-dto',
          },
          {
            name: 'DTO',
            value: 'dto',
          },
          {
            name: 'Entity',
            value: 'entity',
          },
          {
            name: 'GetQuery',
            value: 'get-query',
          },
          {
            name: 'NotFoundException',
            value: 'not-found-exception',
          },
          {
            name: 'PageOptionsDTO',
            value: 'page-options-dto',
          },
          {
            name: 'Repository',
            value: 'repository',
          },
          {
            name: 'Service',
            value: 'service',
          },
          {
            name: 'TranslationDTO',
            value: 'translation-dto',
          },
          {
            name: 'TranslationEntity',
            value: 'translationEntity',
          },
          {
            name: 'TranslationRepository',
            value: 'translation-repository',
          },
          {
            name: 'UpdateDTO',
            value: 'update-dto',
          },
        ],
      }
    ])
    .then(answer => {
      //// For debugging
      // console.log(answer)
      return answer;
    })
  }
}
