import { ApiModelProperty } from '@nestjs/swagger';

export class PageMetaDto {
  @ApiModelProperty()
  readonly page: number;

  @ApiModelProperty()
  readonly pageSize: number;

  @ApiModelProperty()
  readonly itemCount: number;

  @ApiModelProperty()
  readonly pageCount: number;

  constructor(page: number, pageCount: number, itemCount: number) {
    this.page = page;
    this.pageSize = pageCount;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(itemCount / pageCount);
  }
}
