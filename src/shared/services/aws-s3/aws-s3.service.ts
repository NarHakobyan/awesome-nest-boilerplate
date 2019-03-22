import * as AWS from 'aws-sdk';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config.service';

@Injectable()
export class AwsS3Service {
  private readonly _s3: AWS.S3;

  constructor(public configService: ConfigService) {
    const options: AWS.S3.Types.ClientConfiguration = {
      apiVersion: '2010-12-01',
      region: 'eu-central-1',
    };

    const awsS3Config = configService.awsS3Config;
    if (
      awsS3Config.accessKeyId &&
      awsS3Config.secretAccessKey
    ) {
      options.credentials = awsS3Config;
    }

    this._s3 = new AWS.S3(options);

  }

  uploadImage(fileName: string, buffer: Buffer) {
    return this._s3.putObject({
      Bucket: this.configService.awsS3Config.bucketName,
      Body: buffer,
      ACL: 'public-read',
      Key: 'images/' + fileName,
    }).promise();
  }
}
