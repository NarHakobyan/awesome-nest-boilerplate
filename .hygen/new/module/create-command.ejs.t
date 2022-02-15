---
to: "src/modules/<%= h.fileName(name) %>/commands/<%= h.createCommandFileName(name) %>.ts"
unless_exists: true
skip_if: <%= !blocks.includes('CreateCommand') %>
---
<%

 ClassName = h.ClassName(name);
 fieldName = h.changeCase.camel(ClassName);

 CreateCommandName = h.CreateCommandName(name);
 CreateHandlerName = h.CreateHandlerName(name);

 CreateDtoName = h.CreateDtoName(name);
 createDtoName = h.changeCase.camel(CreateDtoName);
 createDtoFileName = h.createDtoFileName(name);

 EntityName = h.EntityName(name);
 entityName = h.changeCase.camel(EntityName);

 EntityName = h.EntityName(name);
 entityName = h.changeCase.camel(EntityName);
 entityFileName = h.entityFileName(name);

 RepositoryName = h.RepositoryName(name);
 TranslationRepositoryName = h.TranslationRepositoryName(name);
 repositoryName = h.changeCase.camel(RepositoryName);
 translationRepositoryName = h.changeCase.camel(TranslationRepositoryName);
 repositoryFileName = h.repositoryFileName(name);

 TranslationEntityName = h.TranslationEntityName(name);
 TranslationDtoName = h.TranslationDtoName(name);
 translationEntityFileName = h.translationEntityFileName(name);
 translationRepositoryFileName = h.translationRepositoryFileName(name);
 translationEntityName = h.changeCase.camel(TranslationEntityName);

%>import type { ICommand, ICommandHandler } from '@nestjs/cqrs';
import { CommandHandler } from '@nestjs/cqrs';
import { find } from 'lodash';

import type { <%= CreateDtoName %> } from '../dtos/<%= createDtoFileName %>';
import type { <%= EntityName %> } from '../<%= entityFileName %>';
import { <%= RepositoryName %> } from '../<%= repositoryFileName %>';
import type { <%= TranslationEntityName %> } from '../<%= translationEntityFileName %>';
import { <%= TranslationRepositoryName %> } from '../<%= translationRepositoryFileName %>';

export class <%= CreateCommandName %> implements ICommand {
  constructor(
    public readonly <%=createDtoName %>: <%= CreateDtoName %>,
  ) {}
}

@CommandHandler(<%= CreateCommandName %>)
export class <%= CreateHandlerName %>
  implements ICommandHandler<<%= CreateCommandName %>, <%= EntityName %>>
{
  constructor(
    private <%= repositoryName %>: <%= RepositoryName %>,
    private <%= translationRepositoryName %>: <%= TranslationRepositoryName %>,
  ) {}

  async execute(command: <%= CreateCommandName %>) {
    const { <%=createDtoName %> } = command;
    const <%= entityName %> = this.<%= repositoryName %>.create();
    const translations: <%= TranslationEntityName %>[] = [];

    await this.<%= repositoryName %>.save(<%= entityName %>);

    // FIXME: Create generic function for translation creation
    for (const createTranslationDto of <%=createDtoName %>.title) {
      const languageCode = createTranslationDto.languageCode;
      const translationEntity = this.<%= translationRepositoryName %>.create({
        <%= fieldName %>Id: <%= entityName %>.id,
        languageCode,
        title: createTranslationDto.text,
        description: find(<%=createDtoName %>.description, {
          languageCode,
        })!.text,
      });

      translations.push(translationEntity);
    }

    await this.<%= translationRepositoryName %>.save(translations);

    <%= entityName %>.translations = translations;

    return <%= entityName %>;
  }
}
