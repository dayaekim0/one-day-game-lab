import { canvasToBlob, type LoadedImage } from './resize';

export const STICKER_EMOJIS = ['🐻', '😎', '❤️', '🐰', '⭐', '🌸', '🐥', '🙈'] as const;

/** 위치·크기는 사진 크기 대비 비율(0~1)로 저장 → 화면 크기와 무관하게 합성 */
export interface Sticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  /** 사진 너비 대비 스티커 크기 */
  size: number;
}

/** 사진 + 스티커를 하나의 JPEG로 합성. 원본(스티커 없는 사진)은 저장하지 않음 */
export async function composeWithStickers(img: LoadedImage, stickers: Sticker[]): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('이 브라우저에서는 사진 편집을 할 수 없어요.');
  ctx.drawImage(img.bitmap, 0, 0, img.width, img.height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const s of stickers) {
    const px = Math.round(s.size * img.width);
    ctx.font = `${px}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    ctx.fillText(s.emoji, s.x * img.width, s.y * img.height);
  }
  return canvasToBlob(canvas);
}
