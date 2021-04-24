import { ApiProperty } from '@nestjs/swagger';

export class TokenPayloadDto {
    @ApiProperty()
    expiresIn: number;

    @ApiProperty()
    accessToken: string;

    constructor(data: { expiresIn: number; accessToken: string }) {
        this.expiresIn = data.expiresIn;
        this.accessToken = data.accessToken;
    }
}
