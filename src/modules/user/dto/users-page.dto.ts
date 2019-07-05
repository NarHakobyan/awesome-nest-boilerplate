import { UserDto } from './UserDto';
import { ApiModelProperty } from '@nestjs/swagger';
import { PageMetaDto } from '../../../common/dto/PageMetaDto';

export class UsersPageDto {
    @ApiModelProperty({
        type: UserDto,
        isArray: true,
    })
    readonly data: UserDto[];

    @ApiModelProperty()
    readonly meta: PageMetaDto;

    constructor(data: UserDto[], meta: PageMetaDto) {
        this.data = data;
        this.meta = meta;
    }
}
