'use strict';

import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { ToInt } from '../../decorators/transforms.decorator';

export class AbstractSearchDto {
    @ApiModelProperty()
    @IsString()
    @IsNotEmpty()
    q: string;

    @ApiModelProperty()
    @IsNumber()
    @IsNotEmpty()
    @ToInt()
    page: number;

    @ApiModelPropertyOptional()
    @IsNumber()
    @IsOptional()
    @ToInt()
    take = 10;

    get skip() {
        return (this.page - 1) * this.take;
    }
}
