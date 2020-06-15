import { Controller, Get } from '@nestjs/common';
import {
    Client,
    ClientProxy,
    MessagePattern,
    Transport,
} from '@nestjs/microservices';
import { Observable } from 'rxjs';

@Controller('math')
export class MathController {
    @Client({ transport: Transport.TCP, options: { port: 4000 } })
    client: ClientProxy;

    @Get('sum')
    call(): Observable<number> {
        const pattern = { cmd: 'sum' };
        const data = [1, 2, 3, 3333, 5];
        return this.client.send<number>(pattern, data);
    }

    @MessagePattern({ cmd: 'sum' })
    sum(data: number[]): number {
        return (data || []).reduce((a, b) => a + b);
    }
}
