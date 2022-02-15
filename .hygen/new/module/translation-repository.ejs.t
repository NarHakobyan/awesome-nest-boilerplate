---
to: "src/modules/<%= h.fileName(name) %>/<%= h.translationRepositoryFileName(name) %>.ts"
unless_exists: true
skip_if: <%= !blocks.includes('TranslationRepository') %>
---
<%
 TranslationEntityName = h.TranslationEntityName(name);
 translationEntityFileName = h.translationEntityFileName(name);

 TranslationRepositoryName = h.TranslationRepositoryName(name);
%>import { EntityRepository, Repository } from 'typeorm';

import { <%= TranslationEntityName %> } from './<%= translationEntityFileName %>';

@EntityRepository(<%= TranslationEntityName %>)
export class <%= TranslationRepositoryName %> extends Repository<<%= TranslationEntityName %>> {}
