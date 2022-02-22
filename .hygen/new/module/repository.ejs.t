---
to: "src/modules/<%= h.fileName(name) %>/<%= h.repositoryFileName(name) %>.ts"
unless_exists: true
skip_if: <%= !blocks.includes('Repository') %>
---
<%
 EntityName = h.EntityName(name);
 entityFileName = h.entityFileName(name);

 RepositoryName = h.RepositoryName(name);
%>import { EntityRepository, Repository } from 'typeorm';

import { <%= EntityName %> } from './<%= entityFileName %>';

@EntityRepository(<%= EntityName %>)
export class <%= RepositoryName %> extends Repository<<%= EntityName %>> {}
