import { generateUploadUrl, getPublicUrl } from '../lib/r2';

const CONTENT_TYPES: Record<'epub' | 'pdf' | 'md', string> = {
  epub: 'application/epub+zip',
  pdf: 'application/pdf',
  md: 'text/markdown',
};

export async function requestUpload(
  userId: string,
  fileName: string,
  fileType: 'epub' | 'pdf' | 'md',
): Promise<{ uploadUrl: string; publicUrl: string; objectKey: string }> {
  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const objectKey = `books/${userId}/${timestamp}_${safeName}`;

  const contentType = CONTENT_TYPES[fileType];
  const uploadUrl = await generateUploadUrl(objectKey, contentType);

  return {
    uploadUrl,
    publicUrl: getPublicUrl(objectKey),
    objectKey,
  };
}
