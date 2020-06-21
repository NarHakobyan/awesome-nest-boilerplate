import { Controller, Get, Render } from '@nestjs/common';

@Controller('accounts')
export class AccountController {
    @Get()
    @Render('account/views/index')
    root() {
        return { message: 'Hello world!' };
    }
}
