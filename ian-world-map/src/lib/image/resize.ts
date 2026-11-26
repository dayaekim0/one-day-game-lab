/**
 * 업로드 전 사진 처리.
 * - 긴 변 maxSize로 축소 + JPEG 재인코딩 → 용량 절감
 * - 캔버스로 다시 그리므로 EXIF(촬영 위치 GPS 등)가 자동으로 제거됨
 * - 휴대폰 사진의 회전 정보(orientation)는 반영해서 그림
 */
export interface LoadedImage {
  bitmap: ImageBitmap | HTMLImageElement;
  width: number;
  height: number;
}

export async function loadImage(file: Blob, maxSize = 1600): Promise<LoadedImage> {
  let source: ImageBitmap | HTMLImageElement;
  try {
    source = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    source = await new Promise<HTMLImageElement>((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('사진을 열 수 없어요. 다른 사진을 골라 주세요.'));
      };
      img.src = url;
    });
  }
  const w0 = 'naturalWidth' in source ? source.naturalWidth : source.width;
  const h0 = 'naturalHeight' in source ? source.naturalHeight : source.height;
  const scale = Math.min(1, maxSize / Math.max(w0, h0));
  return { bitmap: source, width: Math.round(w0 * scale), height: Math.round(h0 * scale) };
}

export function canvasToBlob(canvas: HTMLCanvasElement, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('사진 저장에 실패했어요.'))), 'image/jpeg', quality),
  );
}

export const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp,image/heic,image/heif';
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 원본 20MB까지 허용 (축소 후 저장)
