import { withBase } from "./withBase";

// Shared by the pages that draw downloadable images on a canvas (/banners,
// /countdown): image loading, cover-fit drawing and the file download.

const imageCache = new Map<string, Promise<HTMLImageElement>>();

export function loadImage(path: string) {
  let image = imageCache.get(path);
  if (!image) {
    image = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Could not load ${path}`));
      img.src = withBase(path);
    });
    imageCache.set(path, image);
  }
  return image;
}

/**
 * Draws the image into the rectangle like `object-fit: cover`, `zoom` times
 * closer. The focus point (0–1 across the image) lands in the middle of the
 * rectangle, as far as the image's edges allow.
 */
export function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  width: number,
  height: number,
  { zoom = 1, focusX = 0.5, focusY = 0.5, x = 0, y = 0 } = {}
) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = Math.max(width / iw, height / ih) * zoom;
  const sw = width / scale;
  const sh = height / scale;
  const sx = Math.min(Math.max(iw * focusX - sw / 2, 0), iw - sw);
  const sy = Math.min(Math.max(ih * focusY - sh / 2, 0), ih - sh);
  ctx.drawImage(img, sx, sy, sw, sh, x, y, width, height);
}

export type ImageType = "image/jpeg" | "image/png";

export function downloadCanvas(canvas: HTMLCanvasElement, name: string, type: ImageType) {
  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${name}.${type === "image/jpeg" ? "jpg" : "png"}`;
      link.click();
      URL.revokeObjectURL(url);
    },
    type,
    0.9
  );
}
