'use strict';

import { Transform } from 'class-transformer';
import { ApiModelProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class AbstractSearchDto {
    @ApiModelProperty()
    @IsString()
    @IsNotEmpty()
    q: string;

    @ApiModelProperty()
    @IsNumber()
    @IsNotEmpty()
    @Transform(Number)
    page: number;

    get skip() {
        return (this.page - 1) * this.take;
    }

    get take() {
        return 10;
    }
}
