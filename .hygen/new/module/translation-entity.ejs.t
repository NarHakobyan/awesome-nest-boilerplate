---
to: "src/modules/<%= h.fileName(name) %>/<%= h.translationEntityFileName(name) %>.ts"
unless_exists: true
---
<%
 ClassName = h.ClassName(name);
 fieldName = h.changeCase.camel(ClassName);
 DtoName = h.DtoName(name);
 dtoFileName = h.dtoFileName(name);
 translationDtoFileName = h.translationDtoFileName(name);
 translationEntityFileName = h.translationEntityFileName(name);
 DtoOptionName = h.DtoOptionName(name);
 var_name = h.inflection.dasherize(name);
 EntityName = h.EntityName(name);
 entityName = h.changeCase.camel(EntityName);
 TranslationEntityName = h.TranslationEntityName(name);
 TranslationDtoName = h.TranslationDtoName(name);
 translationEntityName = h.changeCase.camel(TranslationEntityName);
%>import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractTranslationEntity } from '../../common/abstract.entity';
import { UseDto } from '../../decorators';
import { <%= TranslationDtoName %> } from './dtos/<%= translationDtoFileName %>';
import { <%= EntityName %> } from './<%= entityFileName %>';

@Entity({ name: '<%= var_name %>_translations' })
@UseDto(<%= TranslationDtoName %>)
export class <%= TranslationEntityName %> extends AbstractTranslationEntity<<%= TranslationDtoName %>> {
  @Column({ type: 'uuid' })
  <%= fieldName %>Id: Uuid;

  @ManyToOne(() => <%= EntityName %>, (<%= entityName %>) => <%= entityName %>.translations, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: '<%= var_name %>_id' })
  <%= fieldName %>: <%= EntityName %>;
}

