import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env';

export const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

export async function generateUploadUrl(
  objectKey: string,
  contentType: string,
  expiresIn = 3600,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: objectKey,
    ContentType: contentType,
  });

  return getSignedUrl(s3, command, { expiresIn });
}

export function getPublicUrl(objectKey: string): string {
  return `${env.R2_PUBLIC_URL}/${objectKey}`;
}

export async function getObject(objectKey: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: objectKey,
  });

  const response = await s3.send(command);
  const parts: Uint8Array[] = [];
  for await (const part of response.Body as any) {
    parts.push(part);
  }
  return Buffer.concat(parts);
}

export async function uploadBuffer(
  objectKey: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: objectKey,
    Body: buffer,
    ContentType: contentType,
  });

  await s3.send(command);
  return getPublicUrl(objectKey);
}

export function extractObjectKey(publicUrl: string): string | null {
  const prefix = `${env.R2_PUBLIC_URL}/`;
  if (publicUrl.startsWith(prefix)) {
    return publicUrl.substring(prefix.length);
  }
  return null;
}

export async function deleteObject(objectKey: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: objectKey,
  });

  await s3.send(command);
}

export async function listObjectKeys(): Promise<string[]> {
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const command = new ListObjectsV2Command({
      Bucket: env.R2_BUCKET_NAME,
      ContinuationToken: continuationToken,
    });

    const response = await s3.send(command);
    
    if (response.Contents) {
      for (const obj of response.Contents) {
        if (obj.Key) keys.push(obj.Key);
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return keys;
}
