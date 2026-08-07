import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import {
  ConversionRequest,
  ConversionResponse,
  FileData,
  PlanInfo,
  QuotaStatusResponse,
} from '../models/converter-api.model';
import { ConverterApiClient } from './converter-api-client.service';
import { FilePreparationService } from './file-preparation.service';
import { IcsExportService } from './ics-export.service';
import { LoggerService } from './logger.service';
import { QuotaService } from './quota.service';

export type {
  ConversionRequest,
  ConversionResponse,
  FileData,
  PlanInfo,
  QuotaStatus,
  QuotaStatusResponse,
} from '../models/converter-api.model';
export { ENABLE_LEGACY_QUOTA_RESPONSE_UNTIL_2026_10_01 } from './quota.service';

/**
 * Conversion facade retained as the stable component-facing API.
 * Network, quota/identity, file/PDF preparation and download responsibilities are delegated to
 * focused services so the UI does not depend on their implementation details.
 */
@Injectable({ providedIn: 'root' })
export class ConverterService {
  private readonly api = inject(ConverterApiClient);
  private readonly quota = inject(QuotaService);
  private readonly files = inject(FilePreparationService);
  private readonly exporter = inject(IcsExportService);
  private readonly logger = inject(LoggerService);

  // Kept as a private compatibility property for existing diagnostics and tests.
  private get userId(): string {
    return this.quota.getUserId();
  }

  getQuotaStatus(): Observable<QuotaStatusResponse> {
    return this.quota.getStatus();
  }

  clearQuotaCache(): void {
    this.quota.clearCache();
  }

  fetchPlans(): Observable<PlanInfo[]> {
    return this.api.getPlans().pipe(
      catchError((error) => {
        this.logger.error('Failed to fetch plans', 'ConverterService', error);
        return of([]);
      }),
    );
  }

  getUserId(): string {
    return this.userId;
  }

  convertToIcs(
    files: FileData[],
    timeZone?: string,
    currentDate?: string,
  ): Observable<ConversionResponse> {
    const request: ConversionRequest = {
      files: files.map(({ dataUrl }) => ({ dataUrl })),
      timeZone: timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      currentDate: currentDate || new Date().toISOString().split('T')[0],
      userId: this.userId,
    };

    return this.api.convert(request, crypto.randomUUID());
  }

  convertSingleFile(
    file: FileData,
    timeZone?: string,
    currentDate?: string,
  ): Observable<ConversionResponse> {
    return this.convertToIcs([file], timeZone, currentDate);
  }

  fileToDataUrl(file: File): Promise<string> {
    return this.files.fileToDataUrl(file);
  }

  pdfToImages(file: File): Promise<string[]> {
    return this.files.pdfToImages(file);
  }

  downloadIcsFile(icsContent: string, filename?: string): void {
    this.exporter.download(icsContent, filename);
  }
}
