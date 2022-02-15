---
to: "src/modules/<%= h.fileName(name) %>/queries/<%= h.getQueryFileName(name) %>.ts"
unless_exists: true
skip_if: <%= !blocks.includes('GetQuery') %>
---
<%

 ClassName = h.ClassName(name);
 fieldName = h.changeCase.camel(ClassName);

 GetQueryName = h.GetQueryName(name);
 GetHandlerName = h.GetHandlerName(name);

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

%>import type { ICommand, IQueryHandler } from '@nestjs/cqrs';
import { QueryHandler } from '@nestjs/cqrs';

import { <%= RepositoryName %> } from '../<%= repositoryFileName %>';

export class <%= GetQueryName %> implements ICommand {
  constructor(
    public readonly userId: Uuid,
  ) {}
}

@QueryHandler(<%= GetQueryName %>)
export class <%= GetHandlerName %> implements IQueryHandler<<%= GetQueryName %>> {
  constructor(private <%= repositoryName %>: <%= RepositoryName %>) {}

  async execute(query: <%= GetQueryName %>) {
    return this.<%= repositoryName %>.find({
      userId: query.userId,
    });
  }
}
