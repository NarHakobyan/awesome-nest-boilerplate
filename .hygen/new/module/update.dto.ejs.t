---
to: "src/modules/<%= h.fileName(name) %>/dtos/<%= h.updateDtoFileName(name) %>.ts"
unless_exists: true
skip_if: <%= !blocks.includes('UpdateDTO') %>
---
<%

UpdateDtoName = h.UpdateDtoName(name);

%>export class <%= UpdateDtoName %> {}
