// utils/fileHelpers.ts
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = (e) => reject(e);
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}