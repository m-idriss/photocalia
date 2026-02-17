import { Injectable, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { PDF_CONVERSION_CONFIG, CALENDAR_CONFIG } from '../constants';
import { AuthService } from './auth.service';

/**
 * Request payload for ICS conversion
 */
export interface ConversionRequest {
  files: FileData[];
  timeZone?: string;
  currentDate?: string;
  userId?: string;
}

/**
 * File data with base64 encoded content
 */
export interface FileData {
  dataUrl: string;
  name: string;
  type: string;
}

/**
 * Response from ICS conversion API
 */
export interface ConversionResponse {
  icsContent: string;
  success: boolean;
  error?: string;
  message?: string;
  details?: {
    dailyLimit?: number;
    used?: number;
    resetsAt?: string;
  };
  contact?: string;
}

/**
 * Quota status information
 */
export interface QuotaStatus {
  usageCount: number;
  limit: number;
  remaining: number;
  plan: string;
}

/**
 * Response from quota status API
 */
export interface QuotaStatusResponse {
  success: boolean;
  quota: QuotaStatus;
  enabled: boolean;
}

/**
 * Service for converting images and PDFs to ICS calendar format.
 * Handles file processing, PDF to image conversion, and ICS file downloads.
 *
 * @example
 * ```typescript
 * constructor(private converterService: ConverterService) {}
 *
 * async convert() {
 *   const dataUrl = await this.converterService.fileToDataUrl(file);
 *   this.converterService.convertToIcs([{ dataUrl, name: file.name, type: file.type }])
 *     .subscribe(response => console.log(response.icsContent));
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class ConverterService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = environment.apiUrl;
  private userId: string;

  constructor() {
    // Initialize userId based on current auth state
    this.userId = this.determineUserId();

    // Watch for auth state changes and update userId accordingly
    effect(() => {
      const user = this.authService.currentUser();
      // Use the user from the signal instead of calling determineUserId again
      const newUserId =
        user && user.email
          ? user.email
          : user && user.uid
            ? user.uid
            : this.getOrCreateAnonymousId();

      if (newUserId !== this.userId) {
        this.userId = newUserId;
      }
    });
  }

  /**
   * Determine the userId based on authentication state
   * Uses authenticated user's email if available, otherwise generates/retrieves anonymous ID
   */
  private determineUserId(): string {
    const currentUser = this.authService.currentUser();

    // If user is authenticated, use their email as userId
    if (currentUser && currentUser.email) {
      return currentUser.email;
    }

    // If user is authenticated but no email, use their uid
    if (currentUser && currentUser.uid) {
      return currentUser.uid;
    }

    // Fall back to anonymous ID for unauthenticated users
    return this.getOrCreateAnonymousId();
  }

  /**
   * Get or create anonymous user ID for usage tracking
   * Stored in localStorage for consistency across sessions
   * Only used when user is not authenticated
   */
  private getOrCreateAnonymousId(): string {
    const STORAGE_KEY = 'photocalia_anonymous_id';

    // Try to get existing ID from localStorage
    try {
      const existingId = localStorage.getItem(STORAGE_KEY);
      if (existingId) {
        return existingId;
      }
    } catch {
      // localStorage might not be available (SSR, private mode, etc.)
    }

    // Generate new anonymous ID
    const newId = this.generateAnonymousId();

    // Try to store it
    try {
      localStorage.setItem(STORAGE_KEY, newId);
    } catch {
      // Ignore storage errors
    }

    return newId;
  }

  /**
   * Generate anonymous user ID using timestamp and random values
   */
  private generateAnonymousId(): string {
    const timestamp = Date.now().toString(36);
    let randomPart: string;
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      // generate 8 random bytes and encode as base36 string for compactness
      const array = new Uint32Array(2); // 2 * 4 bytes = 8 bytes
      window.crypto.getRandomValues(array);
      randomPart = Array.from(array)
        .map((num) => num.toString(36))
        .join('')
        .substring(0, 13);
    } else {
      // fallback - should not happen in modern browsers
      randomPart = Math.random().toString(36).substring(2, 15);
    }
    return `anon_${timestamp}_${randomPart}`;
  }

  /**
   * Get current quota status for the user
   */
  getQuotaStatus(): Observable<QuotaStatusResponse> {
    return this.http.post<QuotaStatusResponse>(`${this.baseUrl}?target=quotaStatus`, {
      userId: this.userId,
    });
  }

  /**
   * Get the current user ID
   */
  getUserId(): string {
    return this.userId;
  }

  /**
   * Convert image/PDF files to ICS calendar format
   * @param files Array of file data (base64 encoded)
   * @param timeZone Optional timezone (defaults to browser timezone)
   * @param currentDate Optional current date (defaults to today)
   */
  convertToIcs(
    files: FileData[],
    timeZone?: string,
    currentDate?: string,
  ): Observable<ConversionResponse> {
    const tz = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const today = currentDate || new Date().toISOString().split('T')[0];

    const request: ConversionRequest = {
      files,
      timeZone: tz,
      currentDate: today,
      userId: this.userId,
    };

    return this.http.post<ConversionResponse>(`${this.baseUrl}/converter`, request);
  }

  /**
   * Convert a single file to ICS calendar format (for batch processing)
   * @param file Single file data (base64 encoded)
   * @param timeZone Optional timezone (defaults to browser timezone)
   * @param currentDate Optional current date (defaults to today)
   */
  convertSingleFile(
    file: FileData,
    timeZone?: string,
    currentDate?: string,
  ): Observable<ConversionResponse> {
    return this.convertToIcs([file], timeZone, currentDate);
  }

  /**
   * Convert a File object to base64 data URL
   */
  fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Convert PDF file to array of image data URLs (one per page)
   * @param file PDF file to convert
   * @returns Promise resolving to array of base64 image data URLs
   */
  async pdfToImages(file: File): Promise<string[]> {
    try {
      // Dynamically import pdfjs-dist only when needed (lazy loading)
      const pdfjsLib = await import('pdfjs-dist');

      // Configure PDF.js worker - using unpkg.com which has better version availability
      // unpkg.com automatically resolves to the closest matching version
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      // Read the PDF file as array buffer
      const arrayBuffer = await file.arrayBuffer();

      // Load the PDF document
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const images: string[] = [];

      // Convert each page to an image
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);

        // Set up canvas with appropriate scale for good quality
        const viewport = page.getViewport({ scale: PDF_CONVERSION_CONFIG.VIEWPORT_SCALE });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          throw new Error('Failed to get canvas context');
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render PDF page to canvas with white background
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        }).promise;

        // Convert canvas to JPEG with quality setting for smaller file size
        const imageDataUrl = canvas.toDataURL('image/jpeg', PDF_CONVERSION_CONFIG.JPEG_QUALITY);

        images.push(imageDataUrl);
      }

      return images;
    } catch (error) {
      console.error('Error converting PDF to images:', error);
      throw new Error('Failed to convert PDF to images. Please ensure the PDF is valid.');
    }
  }

  /**
   * Download ICS content as a file
   */
  downloadIcsFile(
    icsContent: string,
    filename: string = CALENDAR_CONFIG.DEFAULT_ICS_FILENAME,
  ): void {
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
