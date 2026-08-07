import { Injectable, inject } from '@angular/core';
import { PDF_CONVERSION_CONFIG } from '../constants';
import { LoggerService } from './logger.service';

@Injectable({ providedIn: 'root' })
export class FilePreparationService {
  private readonly logger = inject(LoggerService);

  fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async pdfToImages(file: File): Promise<string[]> {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      const images: string[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: PDF_CONVERSION_CONFIG.VIEWPORT_SCALE });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Failed to get canvas context');

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: context, viewport, canvas }).promise;
        images.push(canvas.toDataURL('image/jpeg', PDF_CONVERSION_CONFIG.JPEG_QUALITY));
      }

      return images;
    } catch (error) {
      this.logger.error('Error converting PDF to images', 'FilePreparationService', error);
      throw new Error('Failed to convert PDF to images. Please ensure the PDF is valid.', {
        cause: error,
      });
    }
  }
}
