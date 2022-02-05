---
to: "src/modules/<%= h.fileName(name) %>/<%= h.moduleFileName(name) %>.ts"
unless_exists: true
---
<%

 ModuleName = h.ModuleName(name);
 fileName = h.inflection.dasherize(name);

 ControllerName = h.ControllerName(name);
 controllerFileName = h.controllerFileName(name);

 ServiceName = h.ServiceName(name);
 serviceFileName = h.serviceFileName(name);

 RepositoryName = h.RepositoryName(name);
 repositoryFileName = h.repositoryFileName(name);

 createCommandFileName = h.createCommandFileName(name);
 getQueryFileName = h.getQueryFileName(name);

%>import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { <%= CreateHandlerName %> } from './commands/<%= createCommandFileName %>';
import { <%= ControllerName %> } from './<%= controllerFileName %>';
import { <%= RepositoryName %> } from './<%= repositoryFileName %>';
import { <%= TranslationRepositoryName %> } from './<%= translationRepositoryFileName %>';
import { <%= ServiceName %> } from './<%= serviceFileName %>';
import { <%= GetHandlerName %> } from './queries/<%= getQueryFileName %>';

export const handlers = [
<%= CreateHandlerName %>,
<%= GetHandlerName %>,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([<%= RepositoryName %>, <%= TranslationRepositoryName %>]),
  ],
  providers: [<%= ServiceName %>, ...handlers],
  controllers: [<%= ControllerName %>],
})
export class <%= ModuleName %> {}
