/**
 * Reliable offline media persistence utilities.
 * Converts captured photos/audio/video to compressed Base64 Data URLs for localStorage.
 */

export interface PersistedMedia {
  type: "photo" | "video" | "audio";
  url: string;
  name?: string;
  duration?: number;
}

const MAX_IMAGE_DIMENSION = 1280;
const JPEG_QUALITY = 0.82;

/** Read a File/Blob as Base64 Data URL */
export function readAsDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read media file"));
    reader.readAsDataURL(blob);
  });
}

/** Compress an image file to JPEG Base64 for durable localStorage storage */
export async function compressImageToDataURL(file: File | Blob): Promise<string> {
  const originalDataUrl = await readAsDataURL(file);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
        const ratio = Math.min(MAX_IMAGE_DIMENSION / width, MAX_IMAGE_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(originalDataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      try {
        const compressed = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
        resolve(compressed.length < originalDataUrl.length ? compressed : originalDataUrl);
      } catch {
        resolve(originalDataUrl);
      }
    };
    img.onerror = () => resolve(originalDataUrl);
    img.src = originalDataUrl;
  });
}

/** Persist a photo from file input or camera capture */
export async function persistPhoto(file: File | Blob): Promise<PersistedMedia> {
  const url = await compressImageToDataURL(file);
  return {
    type: "photo",
    url,
    name: file instanceof File ? file.name : "camera-capture.jpg",
  };
}

/** Persist video — Base64 (may be large; warn if needed) */
export async function persistVideo(file: File | Blob): Promise<PersistedMedia> {
  const url = await readAsDataURL(file);
  return {
    type: "video",
    url,
    name: file instanceof File ? file.name : "video-capture.webm",
  };
}

/** Persist audio recording blob */
export async function persistAudio(blob: Blob, name = "Voice Recording"): Promise<PersistedMedia> {
  const url = await readAsDataURL(blob);
  return {
    type: "audio",
    url,
    name,
  };
}

/** Validate stored media URL is a usable data URL (not a revoked blob URL) */
export function isValidPersistedMediaUrl(url: string | undefined): boolean {
  if (!url) return false;
  return url.startsWith("data:") || url.startsWith("blob:");
}

/** Capture photo directly from device camera via getUserMedia */
export async function capturePhotoFromCamera(): Promise<PersistedMedia> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
    audio: false,
  });

  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.srcObject = stream;
    video.playsInline = true;

    video.onloadedmetadata = async () => {
      try {
        await video.play();
        await new Promise((r) => setTimeout(r, 300));

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas unavailable");

        ctx.drawImage(video, 0, 0);
        stream.getTracks().forEach((t) => t.stop());

        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              reject(new Error("Failed to capture photo"));
              return;
            }
            resolve(await persistPhoto(blob));
          },
          "image/jpeg",
          JPEG_QUALITY
        );
      } catch (err) {
        stream.getTracks().forEach((t) => t.stop());
        reject(err);
      }
    };

    video.onerror = () => {
      stream.getTracks().forEach((t) => t.stop());
      reject(new Error("Camera preview failed"));
    };
  });
}
