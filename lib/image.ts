export async function compressImage(file: File) {
  let maxSize = 960;
  let quality = 0.6;
  let dataUrl = await encodeJpeg(file, maxSize, quality);
  while (dataUrl.length > 320_000 && quality > 0.34) {
    quality -= 0.08;
    maxSize = Math.round(maxSize * 0.88);
    dataUrl = await encodeJpeg(file, maxSize, quality);
  }
  return dataUrl;
}

async function encodeJpeg(file: File, maxSize: number, quality: number) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas indisponível");
  context.drawImage(bitmap, 0, 0, width, height);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("Falha ao comprimir"))),
      "image/jpeg",
      quality,
    );
  });
  return blobToDataUrl(blob);
}

export function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
