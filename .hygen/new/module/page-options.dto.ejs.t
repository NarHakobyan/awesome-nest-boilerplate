---
to: "src/modules/<%= h.fileName(name) %>/dtos/<%= h.pageOptionsDtoFileName(name) %>.ts"
unless_exists: true
---
<%

 PageOptionsDtoName = h.PageOptionsDtoName(name);

%>import { PageOptionsDto } from '../../../common/dto/page-options.dto';

export class <%= PageOptionsDtoName %> extends PageOptionsDto {}
