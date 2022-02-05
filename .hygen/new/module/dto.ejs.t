---
to: "src/modules/<%= h.fileName(name) %>/dtos/<%= h.dtoFileName(name) %>.ts"
unless_exists: true
---
<%

 DtoName = h.DtoName(name);
 DtoOptionName = h.DtoOptionName(name);
 EntityName = h.EntityName(name);
 entityName = h.changeCase.camel(EntityName);
 entityFileName = h.entityFileName(name);

%>import { AbstractDto } from '../../../common/dto/abstract.dto';
import type { <%= EntityName %> } from '../<%= entityFileName %>';

export interface <%= DtoOptionName %> {
}

export class <%= DtoName %> extends AbstractDto {
  constructor(entityName: <%= EntityName %>, options?: <%= DtoOptionName %>) {
    super(entityName);
  }
}
