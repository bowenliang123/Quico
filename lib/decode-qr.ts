import jsQR from 'jsqr';

/**
 * 从图片文件中解码二维码内容
 * @returns 解码出的文本, 识别失败返回 null
 */
export async function decodeQrFromFile(file: File): Promise<string | null> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    bitmap.close();
    return null;
  }
  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  bitmap.close();
  return jsQR(imageData.data, imageData.width, imageData.height)?.data ?? null;
}
