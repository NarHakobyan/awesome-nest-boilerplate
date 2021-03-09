import { ApiProperty } from '@nestjs/swagger';

import { PageMetaDto } from './PageMetaDto';

export class PageDto<T> {
    @ApiProperty({ isArray: true })
    readonly data: T[];

    @ApiProperty()
    readonly meta: PageMetaDto;

    constructor(data: T[], meta: PageMetaDto) {
        this.data = data;
        this.meta = meta;
    }
}
