---
to: "src/modules/<%= h.fileName(name) %>/exceptions/<%= h.notFoundExceptionFileName(name) %>.ts"
unless_exists: true
---
<%

 ClassName = h.ClassName(name);
 fieldName = h.changeCase.camel(ClassName);
 NotFoundExceptionName = h.NotFoundExceptionName(name);

%>import { NotFoundException } from '@nestjs/common';

export class <%= NotFoundExceptionName %> extends NotFoundException {
  constructor(error?: string) {
    super('error.<%= fieldName %>NotFound', error);
  }
}
