---
to: "src/modules/<%= h.fileName(name) %>/dtos/<%= h.translationDtoFileName(name) %>.ts"
unless_exists: true
skip_if: <%= !blocks.includes('TranslationDTO') %>
---
<%

 TranslationDtoName = h.TranslationDtoName(name);
 translationEntityFileName = h.translationEntityFileName(name);
 TranslationEntityName = h.TranslationEntityName(name);
 translationEntityName = h.changeCase.camel(TranslationEntityName);

%>import { AbstractTranslationDto } from '../../../common/dto/abstract.dto';
import { LanguageCode } from '../../../constants';
import { ApiEnumPropertyOptional } from '../../../decorators';
import type { <%= TranslationEntityName %> } from '../<%= translationEntityFileName %>';

export class <%= TranslationDtoName %> extends AbstractTranslationDto {
  @ApiEnumPropertyOptional(() => LanguageCode)
  languageCode: LanguageCode;

  constructor(<%= translationEntityName %>: <%= TranslationEntityName %>) {
    super(<%= translationEntityName %>);

    this.languageCode = <%= translationEntityName %>.languageCode;
  }
}
