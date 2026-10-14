/**
 * Client-side image compression and resizing utility.
 * Compresses raw high-resolution camera / phone photos (2MB - 15MB) into ultra-lightweight,
 * crisp thumbnails (8KB - 30KB).
 *
 * This prevents hitting:
 * 1. Google Cloud Firestore single-document limit (1 MiB / 1,048,576 bytes)
 * 2. Browser localStorage quota limit (~5 MB)
 * 3. Cross-tab synchronization lag
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxFileSizeKb?: number;
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 240,
  maxHeight: 240,
  quality: 0.8,
  maxFileSizeKb: 45 // 45KB max per thumbnail ensures dozens of images fit easily in 1MB Firestore document
};

/**
 * Calculates approximate size in kilobytes of a base64 string or data URL
 */
export function getImageSizeKb(dataUrl: string): number {
  if (!dataUrl) return 0;
  // Base64 overhead is ~4/3, string length in bytes is roughly (len * 3) / 4
  const base64Index = dataUrl.indexOf(";base64,");
  const str = base64Index >= 0 ? dataUrl.slice(base64Index + 8) : dataUrl;
  return Math.round(((str.length * 3) / 4) / 1024);
}

/**
 * Formats byte / KB size into human-readable text
 */
export function formatSizeText(kb: number): string {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

/**
 * Compresses an image file from <input type="file"> into a lightweight Base64 JPEG data URL.
 */
export async function compressImageFile(
  file: File,
  customOptions?: CompressionOptions
): Promise<string> {
  const options = { ...DEFAULT_OPTIONS, ...customOptions };

  if (!file.type.startsWith("image/")) {
    throw new Error("Selected file is not an image.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) return reject(new Error("Empty image file."));

      const img = new Image();
      img.onerror = () => reject(new Error("Failed to decode image data."));
      img.onload = () => {
        try {
          const result = renderCanvasCompressed(img, options.maxWidth, options.maxHeight, options.quality);
          const sizeKb = getImageSizeKb(result);

          // If still over target max size, run a second tighter pass
          if (sizeKb > options.maxFileSizeKb) {
            const secondPass = renderCanvasCompressed(img, Math.min(180, options.maxWidth), Math.min(180, options.maxHeight), 0.65);
            resolve(secondPass);
          } else {
            resolve(result);
          }
        } catch (err) {
          reject(err);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses an existing base64 data URL if it exceeds the specified maximum size.
 */
export async function compressDataUrl(
  dataUrl: string,
  customOptions?: CompressionOptions
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith("data:image/")) return dataUrl;
  
  const options = { ...DEFAULT_OPTIONS, ...customOptions };
  const currentSizeKb = getImageSizeKb(dataUrl);

  // If already under 35KB, no need to recompress
  if (currentSizeKb <= options.maxFileSizeKb) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onerror = () => resolve(dataUrl); // Fallback to original on error
    img.onload = () => {
      try {
        const compressed = renderCanvasCompressed(img, options.maxWidth, options.maxHeight, options.quality);
        resolve(compressed);
      } catch {
        resolve(dataUrl);
      }
    };
    img.src = dataUrl;
  });
}

/**
 * Internal helper to draw image to canvas and return compressed JPEG data URL
 */
function renderCanvasCompressed(
  img: HTMLImageElement,
  maxWidth: number,
  maxHeight: number,
  quality: number
): string {
  let { width, height } = img;

  // Calculate new dimensions keeping aspect ratio
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context is not available.");
  }

  // Use crisp image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Fill with transparent or white background for PNGs with transparency
  ctx.drawImage(img, 0, 0, width, height);

  // Use JPEG for optimal compression ratio (avoids massive PNG overhead)
  return canvas.toDataURL("image/jpeg", quality);
}
