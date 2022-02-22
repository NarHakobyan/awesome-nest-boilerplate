---
to: "src/modules/<%= h.fileName(name) %>/<%= h.entityFileName(name) %>.ts"
unless_exists: true
skip_if: <%= !blocks.includes('Entity') %>
---
<%
 ClassName = h.ClassName(name);
 DtoName = h.DtoName(name);
 fieldName = h.changeCase.camel(ClassName);
 dtoFileName = h.dtoFileName(name);
 translationEntityFileName = h.translationEntityFileName(name);
 DtoOptionName = h.DtoOptionName(name);
 TableName = h.TableName(name);
 EntityName = h.EntityName(name);
 TranslationEntityName = h.TranslationEntityName(name);
 translationEntityName = h.changeCase.camel(TranslationEntityName);
%>import { Entity, OneToMany } from 'typeorm';

import { AbstractEntity } from '../../common/abstract.entity';
import { UseDto } from '../../decorators';
import type { <%= DtoOptionName %> } from './dtos/<%= dtoFileName %>';
import { <%= DtoName %> } from './dtos/<%= dtoFileName %>';
import { <%= TranslationEntityName %> } from './<%= translationEntityFileName %>';

@Entity({ name: '<%= TableName %>' })
@UseDto(<%= DtoName %>)
export class <%= EntityName %> extends AbstractEntity<<%= DtoName %>, <%= DtoOptionName %>> {
  @OneToMany(
    () => <%= TranslationEntityName %>,
    (<%= translationEntityName %>) => <%= translationEntityName %>.<%= fieldName %>,
  )
  translations: <%= TranslationEntityName %>[];
}
