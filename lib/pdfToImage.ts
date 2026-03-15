import type { PDFDocumentProxy } from "pdfjs-dist";

let pdfjs: typeof import("pdfjs-dist") | null = null;

async function getPdfjs() {
  if (!pdfjs) {
    pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
  }
  return pdfjs;
}

export async function pdfToImageFile(file: File): Promise<File> {
  const lib = await getPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf: PDFDocumentProxy = await lib.getDocument({ data: arrayBuffer }).promise;

  const numPages = pdf.numPages;
  const scale = 2.0;

  const canvases: HTMLCanvasElement[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, canvas, viewport }).promise;
    canvases.push(canvas);
  }

  const totalWidth = Math.max(...canvases.map((c) => c.width));
  const totalHeight = canvases.reduce((h, c) => h + c.height, 0);

  const combined = document.createElement("canvas");
  combined.width = totalWidth;
  combined.height = totalHeight;
  const ctx = combined.getContext("2d")!;

  let y = 0;
  for (const canvas of canvases) {
    ctx.drawImage(canvas, 0, y);
    y += canvas.height;
  }

  return new Promise<File>((resolve, reject) => {
    combined.toBlob((blob) => {
      if (!blob) return reject(new Error("Failed to convert PDF to image"));
      const imageName = file.name.replace(/\.pdf$/i, ".png");
      resolve(new File([blob], imageName, { type: "image/png" }));
    }, "image/png");
  });
}
