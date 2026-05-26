import { generateUploadUrl, getPublicUrl } from '../lib/r2';

export async function requestUpload(
  userId: string,
  fileName: string,
  fileType: 'epub' | 'pdf',
): Promise<{ uploadUrl: string; publicUrl: string; objectKey: string }> {
  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const objectKey = `books/${userId}/${timestamp}_${safeName}`;

  const contentType = fileType === 'epub' ? 'application/epub+zip' : 'application/pdf';
  const uploadUrl = await generateUploadUrl(objectKey, contentType);

  return {
    uploadUrl,
    publicUrl: getPublicUrl(objectKey),
    objectKey,
  };
}
