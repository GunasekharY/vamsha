import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BadRequestException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import type { RequestPhotoUploadInput } from '@vamsha/shared-types';
import { PhotoMimeType } from '@vamsha/shared-types';
import { PhotoUploadRequestType } from '../person/dto/person.types';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIMES = new Set<string>(Object.values(PhotoMimeType));

const MIME_EXTENSIONS: Record<string, string> = {
  [PhotoMimeType.JPEG]: 'jpg',
  [PhotoMimeType.PNG]: 'png',
  [PhotoMimeType.WEBP]: 'webp',
};

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    const endpoint = this.config.get<string>('S3_ENDPOINT', 'http://localhost:9000');
    const region = this.config.get<string>('S3_REGION', 'us-east-1');
    const accessKeyId = this.config.get<string>('S3_ACCESS_KEY', 'vamsha');
    const secretAccessKey = this.config.get<string>('S3_SECRET_KEY', 'vamsha_dev_secret');

    this.bucket = this.config.get<string>('S3_BUCKET', 'vamsha-photos');
    this.publicUrl = this.config.get<string>('S3_PUBLIC_URL', `${endpoint}/${this.bucket}`);

    this.client = new S3Client({
      region,
      endpoint,
      forcePathStyle: true,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  async requestPhotoUpload(input: RequestPhotoUploadInput): Promise<PhotoUploadRequestType> {
    if (!ALLOWED_MIMES.has(input.contentType)) {
      throw new BadRequestException('Unsupported image type.');
    }
    if (input.contentLength > MAX_PHOTO_BYTES) {
      throw new BadRequestException('Image exceeds 5 MB limit.');
    }

    const ext = MIME_EXTENSIONS[input.contentType];
    const objectKey = `families/${input.familyId}/persons/${input.personId}/${uuid()}.${ext}`;
    const expiresIn = 900;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: objectKey,
      ContentType: input.contentType,
      ContentLength: input.contentLength,
    });

    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn });
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    return { uploadUrl, objectKey, expiresAt };
  }

  getPublicUrl(objectKey: string): string {
    return `${this.publicUrl}/${objectKey}`;
  }

  validateObjectKey(objectKey: string, familyId: string, personId: string): void {
    const expectedPrefix = `families/${familyId}/persons/${personId}/`;
    if (!objectKey.startsWith(expectedPrefix)) {
      throw new BadRequestException('Invalid object key for this person.');
    }
  }
}
