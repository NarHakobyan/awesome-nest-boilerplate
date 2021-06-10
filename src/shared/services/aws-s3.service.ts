import { Injectable } from '@nestjs/common';
import AWS from 'aws-sdk';
import mime from 'mime-types';

import type { IFile } from '../../interfaces/IFile';
import { ApiConfigService } from './api-config.service';
import { GeneratorService } from './generator.service';

@Injectable()
export class AwsS3Service {
  private readonly s3: AWS.S3;

  constructor(
    public configService: ApiConfigService,
    public generatorService: GeneratorService,
  ) {
    const awsS3Config = configService.awsS3Config;

    const options: AWS.S3.Types.ClientConfiguration = {
      apiVersion: awsS3Config.bucketApiVersion,
      region: awsS3Config.bucketRegion,
    };

    this.s3 = new AWS.S3(options);
  }

  async uploadImage(file: IFile): Promise<string> {
    const fileName = this.generatorService.fileName(
      <string>mime.extension(file.mimetype),
    );
    const key = 'images/' + fileName;
    await this.s3
      .putObject({
        Bucket: this.configService.awsS3Config.bucketName,
        Body: file.buffer,
        ACL: 'public-read',
        Key: key,
      })
      .promise();

    return key;
  }
}
