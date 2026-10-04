export enum PhotoMimeType {
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  WEBP = 'image/webp',
}

export interface RequestPhotoUploadInput {
  familyId: string;
  personId: string;
  contentType: PhotoMimeType;
  contentLength: number;
}

export interface PhotoUploadRequest {
  uploadUrl: string;
  objectKey: string;
  expiresAt: string;
}

export interface ConfirmPhotoUploadInput {
  familyId: string;
  personId: string;
  objectKey: string;
}
