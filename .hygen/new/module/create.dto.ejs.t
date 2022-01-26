---
to: "src/modules/<%= h.fileName(name) %>/dtos/<%= h.createDtoFileName(name) %>.ts"
unless_exists: true
---
<%

 ClassName = h.ClassName(name);
 CreateDtoName = h.CreateDtoName(name);

%>export class <%= CreateDtoName %> {}
