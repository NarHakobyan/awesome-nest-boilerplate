import { S3 } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import mime from 'mime-types';

import type { IFile } from './../../interfaces/IFile.ts';
import { ApiConfigService } from './api-config.service.ts';
import { GeneratorService } from './generator.service.ts';

@Injectable()
export class AwsS3Service {
  private readonly s3: S3;

  constructor(
    public configService: ApiConfigService,
    public generatorService: GeneratorService,
  ) {
    const config = configService.awsS3Config;

    this.s3 = new S3({
      apiVersion: config.bucketApiVersion,
      region: config.bucketRegion,
    });
  }

  async uploadImage(file: IFile): Promise<string> {
    const fileName = this.generatorService.fileName(
      mime.extension(file.mimetype) as string,
    );
    const key = `images/${fileName}`;
    await this.s3.putObject({
      Bucket: this.configService.awsS3Config.bucketName,
      Body: file.buffer,
      ACL: 'public-read',
      Key: key,
    });

    return key;
  }
}
