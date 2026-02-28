import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Use the bundled worker — Vite's ?url import resolves the base path correctly
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function pdfToImages(file: File, maxPages = 10): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = Math.min(pdf.numPages, maxPages);
  const images: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

    images.push(canvas.toDataURL('image/png'));
    canvas.remove();
  }

  return images;
}

export async function imageFileToDataUrl(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve([reader.result as string]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
