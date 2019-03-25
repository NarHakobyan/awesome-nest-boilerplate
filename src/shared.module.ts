import { Module, Global } from '@nestjs/common';
import { ConfigService } from './shared/services/config.service';
import { ValidatorService } from './shared/services/validator.service';
import { AwsS3Service } from './shared/services/aws-s3.service';
import { GeneratorService } from './shared/services/generator.service';

const providers = [ConfigService, ValidatorService, AwsS3Service, GeneratorService];

@Global()
@Module({
    providers,
    imports: [],
    exports: [...providers],
})
export class SharedModule {}
