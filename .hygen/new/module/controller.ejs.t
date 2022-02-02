---
to: "src/modules/<%= h.fileName(name) %>/<%= h.controllerFileName(name) %>.ts"
unless_exists: true
---
<%

 ClassName = h.ClassName(name);
 moduleName = h.moduleName(name);
 fileName = h.fileName(name);
 ControllerName = h.ControllerName(name);
 ServiceName = h.ServiceName(name);
 serviceName = h.changeCase.camel(ServiceName);
 createFunctionName = 'create' + ClassName;
 updateFunctionName = 'update' + ClassName;
 deleteFunctionName = 'delete' + ClassName;
 getAllFunctionName = 'getAll' + ClassName;
 getSingleFunctionName = 'getSingle' + ClassName;
 CreateDtoName = h.CreateDtoName(name);
 createDtoName = h.changeCase.camel(CreateDtoName);
 UpdateDtoName = h.UpdateDtoName(name);
 updateDtoName = h.changeCase.camel(UpdateDtoName);
 PageOptionsDtoName = h.PageOptionsDtoName(name);
 pageOptionsDtoName = h.changeCase.camel(PageOptionsDtoName);
 DtoName = h.DtoName(name);
 createDtoFileName = h.createDtoFileName(name);
 dtoFileName = h.dtoFileName(name);
 pageOptionsDtoFileName = h.pageOptionsDtoFileName(name);
 updateDtoFileName = h.updateDtoFileName(name);
 serviceFileName = h.serviceFileName(name);

%>import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import type { PageDto } from '../../common/dto/page.dto';
import { Auth, UUIDParam } from '../../decorators';
import { <%= CreateDtoName %> } from './dtos/<%= createDtoFileName %>';
import type { <%= DtoName %> } from './dtos/<%= dtoFileName %>';
import { <%= PageOptionsDtoName %> } from './dtos/<%= pageOptionsDtoFileName %>';
import { <%= UpdateDtoName %> } from './dtos/<%= updateDtoFileName %>';
import { <%= ServiceName %> } from './<%= serviceFileName %>';

@Controller('<%= h.inflection.pluralize(fileName).toLowerCase() %>')
@ApiTags('<%= h.inflection.pluralize(fileName).toLowerCase() %>')
export class <%= ControllerName %> {
  constructor(private <%= serviceName %>: <%= ServiceName %>) {}

  @Post()
  @Auth([])
  @HttpCode(HttpStatus.CREATED)
  async <%= createFunctionName %>(@Body() <%= createDtoName %>: <%= CreateDtoName %>) {
    const entity = await this.<%= serviceName %>.<%= createFunctionName %>(<%= createDtoName %>);

    return entity.toDto();
  }

  @Get()
  @Auth([])
  @HttpCode(HttpStatus.OK)
  <%= getAllFunctionName %>(@Query() <%= pageOptionsDtoName %>: <%= PageOptionsDtoName %>): Promise<PageDto<<%= DtoName %>>> {
    return this.<%= serviceName %>.<%= getAllFunctionName %>(<%= pageOptionsDtoName %>);
  }

  @Get(':id')
  @Auth([])
  @HttpCode(HttpStatus.OK)
  async <%= getSingleFunctionName %>(@UUIDParam('id') id: Uuid): Promise<<%= DtoName %>> {
    const entity = await this.<%= serviceName %>.<%= getSingleFunctionName %>(id);

    return entity.toDto();
  }

  @Put(':id')
  @HttpCode(HttpStatus.ACCEPTED)
  <%= updateFunctionName %>(
    @UUIDParam('id') id: Uuid,
    @Body() <%= updateDtoName %>: <%= UpdateDtoName %>,
  ): Promise<void> {
    return this.<%= serviceName %>.<%= updateFunctionName %>(id, <%= updateDtoName %>);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.ACCEPTED)
  async <%= deleteFunctionName %>(@UUIDParam('id') id: Uuid): Promise<void> {
    await this.<%= serviceName %>.<%= deleteFunctionName %>(id);
  }
}
