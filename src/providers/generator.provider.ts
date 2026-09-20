/* eslint-disable sonarjs/pseudo-random */
import { v1 as uuid } from 'uuid';

import { getEnv } from '../config/env/env.schema.ts';

export class GeneratorProvider {
  static uuid(): string {
    return uuid();
  }

  static fileName(ext: string): string {
    return `${GeneratorProvider.uuid()}.${ext}`;
  }

  static getS3PublicUrl(key: string): string {
    if (!key) {
      throw new TypeError('key is required');
    }

    const { AWS_S3_BUCKET_REGION: region, AWS_S3_BUCKET_NAME: bucket } =
      getEnv();

    return `https://s3.${region}.amazonaws.com/${bucket}/${key}`;
  }

  static getS3Key(publicUrl: string): string {
    if (!publicUrl) {
      throw new TypeError('key is required');
    }

    const { AWS_S3_BUCKET_REGION: region, AWS_S3_BUCKET_NAME: bucket } =
      getEnv();

    const exec = new RegExp(
      `(?<=https://s3.${region}.amazonaws.com/${bucket}/).*`,
    ).exec(publicUrl);

    if (!exec) {
      throw new TypeError('publicUrl is invalid');
    }

    return exec[0];
  }

  static generateVerificationCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  static generatePassword(): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = lowercase.toUpperCase();
    const numbers = '0123456789';

    let text = '';

    for (let i = 0; i < 4; i++) {
      text += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
      text += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
      text += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }

    return text;
  }

  /**
   * generate random string
   * @param length
   */
  static generateRandomString(length: number): string {
    return Math.random()
      .toString(36)
      .replaceAll(/[^\dA-Za-z]+/g, '')
      .slice(0, Math.max(0, length));
  }
}
