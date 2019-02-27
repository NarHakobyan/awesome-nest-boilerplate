import { Injectable } from '@nestjs/common';
import { S3, config } from 'aws-sdk';

const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const s3 = new S3();
config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

@Injectable()
export class FileService {

  async upload(buffer: Buffer, key: string): Promise<string> {
    const bucketKey = 'migration-media/' + key;
    await s3.putObject({
      Body: buffer,
      Bucket: AWS_S3_BUCKET_NAME,
      Key: bucketKey,
      ACL: 'public-read',
    }).promise();
    return bucketKey;
  }
}
