import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';

const PRESIGNED_URL_EXPIRY_SECONDS = 60 * 60;

@Injectable()
export class MinioService implements OnModuleInit {
  readonly client: Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    const endpoint = new URL(this.config.get<string>('MINIO_ENDPOINT')!);
    this.bucket = this.config.get<string>('MINIO_BUCKET')!;
    this.client = new Client({
      endPoint: endpoint.hostname,
      port: endpoint.port ? Number(endpoint.port) : endpoint.protocol === 'https:' ? 443 : 80,
      useSSL: endpoint.protocol === 'https:',
      accessKey: this.config.get<string>('MINIO_ACCESS_KEY')!,
      secretKey: this.config.get<string>('MINIO_SECRET_KEY')!,
    });
  }

  async onModuleInit(): Promise<void> {
    const exists = await this.client.bucketExists(this.bucket).catch(() => false);
    if (!exists) {
      await this.client.makeBucket(this.bucket);
    }
  }

  async putObject(key: string, buffer: Buffer, contentType: string): Promise<void> {
    await this.client.putObject(this.bucket, key, buffer, buffer.length, { 'Content-Type': contentType });
  }

  async removeObjects(keys: string[]): Promise<void> {
    await this.client.removeObjects(this.bucket, keys);
  }

  async presignedGetUrl(key: string): Promise<string> {
    return this.client.presignedGetObject(this.bucket, key, PRESIGNED_URL_EXPIRY_SECONDS);
  }
}
