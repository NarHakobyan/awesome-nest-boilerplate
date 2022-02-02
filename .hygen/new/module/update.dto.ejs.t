---
to: "src/modules/<%= h.fileName(name) %>/dtos/<%= h.updateDtoFileName(name) %>.ts"
unless_exists: true
---
<%

UpdateDtoName = h.UpdateDtoName(name);

%>export class <%= UpdateDtoName %> {}
