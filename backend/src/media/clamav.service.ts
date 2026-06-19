import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
// clamdjs ships no type definitions; isolated here behind a small typed wrapper.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const clamdjs = require('clamdjs') as {
  createScanner: (host: string, port: number) => { scanStream: (stream: Readable, timeout?: number) => Promise<string> };
  isCleanReply: (reply: string) => boolean;
};

@Injectable()
export class ClamAvService {
  private readonly logger = new Logger(ClamAvService.name);
  private readonly enabled: boolean;
  private readonly scanner: ReturnType<typeof clamdjs.createScanner> | null = null;

  constructor(config: ConfigService) {
    this.enabled = config.get<boolean>('CLAMAV_ENABLED') ?? false;
    if (this.enabled) {
      this.scanner = clamdjs.createScanner(
        config.get<string>('CLAMAV_HOST')!,
        config.get<number>('CLAMAV_PORT')!,
      );
    }
  }

  async scan(buffer: Buffer): Promise<void> {
    if (!this.enabled || !this.scanner) {
      return;
    }

    let reply: string;
    try {
      reply = await this.scanner.scanStream(Readable.from(buffer), 5000);
    } catch (err) {
      this.logger.error('ClamAV scan failed; rejecting upload (fail-closed)', err as Error);
      throw new ServiceUnavailableException('Virus scan unavailable, please try again later.');
    }

    if (!clamdjs.isCleanReply(reply)) {
      this.logger.warn(`ClamAV flagged an upload as infected: ${reply}`);
      throw new BadRequestException('File rejected by virus scan.');
    }
  }
}
