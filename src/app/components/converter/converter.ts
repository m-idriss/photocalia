import {
  Component,
  signal,
  OnInit,
  PLATFORM_ID,
  inject,
  effect,
  untracked,
  DestroyRef,
  HostListener,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgbPopoverModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { AppTooltipDirective } from '../../shared/directives';

import { ConverterService, FileData } from '../../services/converter';
import { ToastService } from '../../services/toast.service';
import { CalendarStateService } from '../../services/calendar-state.service';
import { Card } from '../card/card';
import { AuthAwareComponent } from '../base/auth-aware.component';
import {
  CalendarEvent,
  BatchFile,
  BatchFileStatus,
  ConversionState,
  transitionConversionState,
} from '../../models';
import { LoggerService } from '../../services/logger.service';
import { FILE_UPLOAD_CONSTRAINTS } from '../../constants';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { toApiClientError } from '../../utils/api-error.utils';
import { generateIcs, parseIcsEvents } from '../../utils/ics.utils';
import { ConverterEventReview } from '../converter-event-review/converter-event-review';
import { ConverterExportActions } from '../converter-export-actions/converter-export-actions';
import { ConverterBatchProgress } from '../converter-batch-progress/converter-batch-progress';
import { ConverterUpload } from '../converter-upload/converter-upload';

@Component({
  selector: 'app-converter',
  imports: [
    Card,
    AppTooltipDirective,
    NgbPopoverModule,
    NgbTooltipModule,
    TranslatePipe,
    ConverterEventReview,
    ConverterExportActions,
    ConverterBatchProgress,
    ConverterUpload,
  ],
  templateUrl: './converter.html',
  styleUrl: './converter.scss',
})
export class Converter extends AuthAwareComponent implements OnInit {
  protected readonly files = signal<File[]>([]);
  protected readonly batchFiles = signal<BatchFile[]>([]); // Batch processing state
  protected readonly isDragging = signal(false);
  protected readonly isProcessing = signal(false);
  protected readonly conversionState = signal<ConversionState>('idle');
  protected readonly isBatchMode = signal(false); // Toggle between batch and single processing
  protected readonly extractedEvents = signal<CalendarEvent[]>([]);
  protected readonly icsContent = signal<string | null>(null);
  protected readonly isBatchDetailsCollapsed = signal(false);
  public readonly quotaRemaining = signal<number | null>(null);
  public readonly quotaLimit = signal<number | null>(null);
  public readonly quotaEnabled = signal<boolean>(false);
  public readonly isQuotaLoading = signal<boolean>(false);
  public readonly planType = signal<string | null>(null);
  // Require user confirmation before allowing download
  public readonly extractionConfirmed = signal<boolean>(false);
  // Show contribution nudge after successful download
  protected readonly showContributionNudge = signal<boolean>(false);

  constructor() {
    super();
    // Watch for calendar state changes and update local events
    effect(() => {
      const calendarEvents = this.calendarStateService.events();
      // Only update if calendar was modified (has events and is different from current)
      if (calendarEvents.length > 0 && calendarEvents !== this.extractedEvents()) {
        this.extractedEvents.set(calendarEvents);
        this.regenerateIcsContent();
      }
    });

    // Watch for auth state changes and refresh quota
    effect(() => {
      // Read the signal directly to ensure proper tracking
      const isAuth = this.authService.isAuthenticated();
      // Only refresh quota when user becomes authenticated, on browser, and not already loading
      // Use untracked() to read isQuotaLoading without subscribing to its changes
      if (isPlatformBrowser(this.platformId)) {
        if (isAuth && !untracked(() => this.isQuotaLoading())) {
          // User signed in -> fetch fresh quota
          this.fetchQuotaStatus();
        }

        if (!isAuth) {
          // User signed out -> clear quota display and conversion state
          this.quotaRemaining.set(null);
          this.quotaLimit.set(null);
          this.quotaEnabled.set(false);
          this.planType.set(null);
          this.isQuotaLoading.set(false);
          this.extractedEvents.set([]);
          this.icsContent.set(null);
        }
      }
    });

    // Listen for export requests from calendar (signal-based)
    effect(() => {
      const count = this.calendarStateService.exportRequestCount();
      if (count > 0) {
        untracked(() => this.downloadIcs());
      }
    });
  }

  // Thumbnail preview state
  protected readonly thumbnailUrls = signal<Map<File, string>>(new Map());
  protected readonly previewFile = signal<{ file: File; url: string } | null>(null);

  private readonly converterService = inject(ConverterService);
  private readonly toastService = inject(ToastService);
  protected readonly calendarStateService = inject(CalendarStateService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(LoggerService);
  private readonly languageService = inject(LanguageService);

  private readonly acceptedTypes = FILE_UPLOAD_CONSTRAINTS.ACCEPTED_TYPES;
  private readonly maxFileSize = FILE_UPLOAD_CONSTRAINTS.MAX_FILE_SIZE;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.handleSharedFiles();
      // Restore persisted conversion results if any
      this.restorePersistedState();
      // Only fetch quota if authenticated (auth effect will handle it)
      // This prevents duplicate calls when component initializes
      if (this.isAuthenticated) {
        this.fetchQuotaStatus();
      }
    }

    // Cleanup thumbnail URLs on destroy
    this.destroyRef.onDestroy(() => this.revokeAllThumbnailUrls());
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.previewFile()) {
      this.closePreview();
    }
  }

  /**
   * Restore conversion results from sessionStorage (via CalendarStateService)
   */
  private restorePersistedState(): void {
    const events = this.calendarStateService.events();
    const icsContent = this.calendarStateService.icsContent();
    if (events.length > 0) {
      this.extractedEvents.set(events);
      this.icsContent.set(icsContent);
      this.setConversionState('review');
    }
  }

  private setConversionState(next: ConversionState): void {
    const state = transitionConversionState(this.conversionState(), next);
    this.conversionState.set(state);
    this.isProcessing.set(state === 'validating' || state === 'processing');
  }

  /**
   * Fetch current quota status for the user
   */
  private fetchQuotaStatus(): void {
    // Prevent duplicate calls if already loading
    if (this.isQuotaLoading()) {
      return;
    }

    this.isQuotaLoading.set(true);

    this.converterService.getQuotaStatus().subscribe({
      next: (response) => {
        if (response.success && response.quota) {
          this.quotaRemaining.set(response.quota.remaining);
          this.quotaLimit.set(response.quota.limit);
          this.quotaEnabled.set(response.enabled);
          this.planType.set(response.quota.plan);
        } else {
          // Hide quota bar if response is not successful
          this.quotaEnabled.set(false);
        }
        this.isQuotaLoading.set(false);
      },
      error: (error) => {
        this.logger.error('Failed to fetch quota status', 'Converter', error);
        // Hide quota bar on error instead of showing partial/incorrect data
        this.quotaEnabled.set(false);
        this.isQuotaLoading.set(false);
      },
    });
  }

  private async handleSharedFiles(): Promise<void> {
    if ('launchQueue' in window) {
      // Web Share Target API doesn't have full TypeScript definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).launchQueue.setConsumer(async (launchParams: any) => {
        if (!launchParams.files?.length) return;

        try {
          const sharedFiles: File[] = [];
          for (const fileHandle of launchParams.files) {
            const file = await fileHandle.getFile();
            sharedFiles.push(file);
          }

          if (sharedFiles.length) {
            this.addFiles(sharedFiles);
            this.scrollToConverter();
          }
        } catch (error) {
          this.logger.error('Error handling shared files', 'Converter', error);
          this.toastService.showError('Failed to load shared files. Please try again.');
        }
      });
    }
  }

  private scrollToConverter(): void {
    setTimeout(() => {
      const converterElement = document.getElementById('converter');
      if (converterElement) converterElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    this.addFiles(Array.from(event.dataTransfer?.files || []));
  }

  protected onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedFiles = Array.from(input.files || []);
    this.addFiles(selectedFiles);
    input.value = '';
  }

  private addFiles(newFiles: File[]): void {
    this.toastService.clearError();
    this.extractedEvents.set([]);
    this.icsContent.set(null);
    if (this.conversionState() !== 'idle') this.setConversionState('idle');

    const validFiles = newFiles.filter((file) => {
      if (this.files().some((f) => f.name === file.name && f.size === file.size)) {
        this.toastService.showError(`Duplicate file skipped: ${file.name}`);
        return false;
      }
      if (!(this.acceptedTypes as readonly string[]).includes(file.type)) {
        this.toastService.showError(`Invalid file type: ${file.name}`);
        return false;
      }
      if (file.size === 0) {
        this.toastService.showError(`Empty file: ${file.name}`);
        return false;
      }
      if (file.size > this.maxFileSize) {
        this.toastService.showError(`File too large: ${file.name}`);
        return false;
      }
      return true;
    });

    if (validFiles.length) {
      this.files.update((current) => [...current, ...validFiles]);
      this.generateThumbnailUrls(validFiles);
    }
  }

  private generateThumbnailUrls(newFiles: File[]): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const entries = Array.from(this.thumbnailUrls().entries());
    for (const file of newFiles) {
      if (file.type.startsWith('image/')) {
        entries.push([file, URL.createObjectURL(file)]);
      }
    }

    this.thumbnailUrls.set(new Map(entries));
  }

  private revokeThumbnailUrl(file: File): void {
    const url = this.thumbnailUrls().get(file);
    if (url) {
      URL.revokeObjectURL(url);
      const entries = Array.from(this.thumbnailUrls().entries()).filter(([f]) => f !== file);

      this.thumbnailUrls.set(new Map(entries));
    }
  }

  private revokeAllThumbnailUrls(): void {
    for (const url of this.thumbnailUrls().values()) {
      URL.revokeObjectURL(url);
    }
    this.thumbnailUrls.set(new Map());
  }

  protected openPreview(file: File): void {
    const url = this.thumbnailUrls().get(file);
    if (url) {
      this.previewFile.set({ file, url });
    }
  }

  protected closePreview(): void {
    this.previewFile.set(null);
  }

  protected async convertToIcs(): Promise<void> {
    this.setConversionState('validating');
    if (!this.files().length) {
      this.toastService.showError('Please add at least one file.');
      this.setConversionState('failure');
      return;
    }

    // Decide whether to use batch mode based on number of files
    const shouldUseBatchMode = this.files().length > 1;
    this.isBatchMode.set(shouldUseBatchMode);

    if (shouldUseBatchMode) {
      await this.convertBatch();
    } else {
      await this.convertSingle();
    }
  }

  /**
   * Convert all files in a single API call (original behavior for single file)
   */
  private async convertSingle(): Promise<void> {
    this.setConversionState('processing');
    this.toastService.clearError();
    this.extractedEvents.set([]);
    this.icsContent.set(null);

    try {
      const fileDataArrays = await Promise.all(
        this.files().map(async (file) => {
          if (file.type === 'application/pdf') {
            const imageDataUrls = await this.converterService.pdfToImages(file);
            return imageDataUrls.map(
              (dataUrl, index) =>
                ({
                  dataUrl,
                  name: `${file.name} (Page ${index + 1})`,
                  type: 'image/jpeg',
                }) as FileData,
            );
          } else {
            const dataUrl = await this.converterService.fileToDataUrl(file);
            return [{ dataUrl, name: file.name, type: file.type } as FileData];
          }
        }),
      );

      const fileData = fileDataArrays.flat();

      this.converterService.convertToIcs(fileData).subscribe({
        next: (response) => {
          if (response.success && response.icsContent) {
            this.icsContent.set(response.icsContent);
            this.parseIcsContent(response.icsContent);
            // Refresh quota status after successful conversion
            this.fetchQuotaStatus();
          } else {
            this.toastService.showError(this.apiErrorMessage(response));
            this.setConversionState('failure');
          }
        },
        error: (err) => {
          const apiError = toApiClientError(err);
          this.toastService.showError(this.languageService.translate(apiError.messageKey));

          if (apiError.code === 'QUOTA_EXCEEDED') {
            // Refresh quota to show updated count
            this.fetchQuotaStatus();
          }
          this.setConversionState('failure');
        },
      });
    } catch (err) {
      this.toastService.showError((err as Error).message || 'Failed to process files.');
      this.setConversionState('failure');
    }
  }

  /**
   * Convert files one by one with progress tracking (batch mode)
   */
  private async convertBatch(): Promise<void> {
    this.setConversionState('processing');
    this.toastService.clearError();
    this.extractedEvents.set([]);
    this.icsContent.set(null);

    // Initialize batch state
    const batchFiles: BatchFile[] = this.files().map((file) => ({
      file,
      status: BatchFileStatus.PENDING,
      progress: 0,
    }));
    this.batchFiles.set(batchFiles);

    // Process each file sequentially
    for (let i = 0; i < batchFiles.length; i++) {
      await this.processSingleBatchFile(i);
    }

    // Combine all successful results
    this.combineResults();
  }

  /**
   * Process a single file in batch mode
   */
  private async processSingleBatchFile(index: number): Promise<void> {
    const batchFile = this.batchFiles()[index];

    // Update status to processing
    this.batchFiles.update((files) =>
      files.map((f, i) =>
        i === index ? { ...f, status: BatchFileStatus.PROCESSING, progress: 10 } : f,
      ),
    );

    try {
      // Convert file to data URL or images (for PDF)
      let fileDataArray: FileData[];

      if (batchFile.file.type === 'application/pdf') {
        this.batchFiles.update((files) =>
          files.map((f, i) => (i === index ? { ...f, progress: 30 } : f)),
        );
        const imageDataUrls = await this.converterService.pdfToImages(batchFile.file);
        fileDataArray = imageDataUrls.map(
          (dataUrl, pageIndex) =>
            ({
              dataUrl,
              name: `${batchFile.file.name} (Page ${pageIndex + 1})`,
              type: 'image/jpeg',
            }) as FileData,
        );
      } else {
        const dataUrl = await this.converterService.fileToDataUrl(batchFile.file);
        fileDataArray = [
          { dataUrl, name: batchFile.file.name, type: batchFile.file.type } as FileData,
        ];
      }

      this.batchFiles.update((files) =>
        files.map((f, i) => (i === index ? { ...f, progress: 50 } : f)),
      );

      // Call API for this single file
      await new Promise<void>((resolve) => {
        this.converterService.convertSingleFile(fileDataArray[0]).subscribe({
          next: (response) => {
            if (response.success && response.icsContent) {
              // Parse events from ICS
              const events = this.parseIcsContentToEvents(response.icsContent);

              this.batchFiles.update((files) =>
                files.map((f, i) =>
                  i === index
                    ? {
                        ...f,
                        status: BatchFileStatus.SUCCESS,
                        progress: 100,
                        icsContent: response.icsContent,
                        events,
                      }
                    : f,
                ),
              );
              resolve();
            } else {
              this.batchFiles.update((files) =>
                files.map((f, i) =>
                  i === index
                    ? {
                        ...f,
                        status: BatchFileStatus.ERROR,
                        progress: 100,
                        error: this.apiErrorMessage(response),
                      }
                    : f,
                ),
              );
              resolve();
            }
          },
          error: (err) => {
            const apiError = toApiClientError(err);
            const errorMsg = this.languageService.translate(apiError.messageKey);

            this.batchFiles.update((files) =>
              files.map((f, i) =>
                i === index
                  ? {
                      ...f,
                      status: BatchFileStatus.ERROR,
                      progress: 100,
                      error: errorMsg,
                    }
                  : f,
              ),
            );

            // Refresh quota if we hit the limit
            if (apiError.code === 'QUOTA_EXCEEDED') {
              this.fetchQuotaStatus();
            }

            resolve();
          },
        });
      });
    } catch (err) {
      this.batchFiles.update((files) =>
        files.map((f, i) =>
          i === index
            ? {
                ...f,
                status: BatchFileStatus.ERROR,
                progress: 100,
                error: (err as Error).message || 'Failed to process file.',
              }
            : f,
        ),
      );
    }
  }

  private apiErrorMessage(error: unknown): string {
    return this.languageService.translate(toApiClientError(error).messageKey);
  }

  /**
   * Combine results from all batch files
   */
  private combineResults(): void {
    const successfulFiles = this.batchFiles().filter((f) => f.status === BatchFileStatus.SUCCESS);

    if (successfulFiles.length === 0) {
      this.toastService.showError('All files failed to process. Please try again.');
      this.setConversionState('failure');
      return;
    }

    // Combine all events
    const allEvents: CalendarEvent[] = [];
    successfulFiles.forEach((file) => {
      if (file.events) {
        allEvents.push(...file.events);
      }
    });

    this.extractedEvents.set(allEvents);
    this.setConversionState('review');

    // Generate combined ICS content
    this.regenerateIcsContent();

    // Show success/error message
    const failedCount = this.batchFiles().filter((f) => f.status === BatchFileStatus.ERROR).length;
    if (failedCount > 0) {
      this.toastService.showError(
        `${successfulFiles.length} file(s) processed successfully. ${failedCount} file(s) failed.`,
      );
      this.toastService.clearSuccess();
    } else {
      this.toastService.showSuccess(`Successfully extracted ${allEvents.length} event(s)!`);
      this.toastService.clearError();
    }

    // Refresh quota status after batch conversion completes
    this.fetchQuotaStatus();

    // Automatically show calendar view when events are extracted (desktop only)
    if (allEvents.length > 0 && isPlatformBrowser(this.platformId) && !this.isMobileDevice()) {
      this.openCalendarView();
    }
  }

  /**
   * Parse ICS content and return array of events (without updating state)
   */
  private parseIcsContentToEvents(icsContent: string): CalendarEvent[] {
    try {
      return parseIcsEvents(icsContent, false);
    } catch (error) {
      this.logger.error('Failed to parse ICS', 'Converter', error);
      return [];
    }
  }

  // ⚡ Parse ICS content using ical.js wrapper (works dev + prod)
  private parseIcsContent(icsContent: string): void {
    try {
      const events = parseIcsEvents(icsContent);

      events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

      this.extractedEvents.set(events);
      this.setConversionState('review');
      // Persist ICS content for restore on refresh
      this.calendarStateService.updateIcsContent(this.icsContent());
      this.toastService.showSuccess(
        `Successfully extracted ${events.length} event(s) from your file!`,
      );
      this.toastService.clearError();

      // Automatically show calendar view when events are extracted (desktop only)
      if (isPlatformBrowser(this.platformId) && !this.isMobileDevice()) {
        this.openCalendarView();
      }
    } catch (error) {
      this.logger.error('Failed to parse repaired ICS', 'Converter', error);
      this.toastService.showError('Failed to parse generated ICS file (even after repair).');
      this.toastService.clearSuccess();
      this.extractedEvents.set([]);
      this.setConversionState('failure');
    }
  }

  protected downloadIcs(): void {
    if (!this.icsContent() || !this.extractionConfirmed()) return;
    this.converterService.downloadIcsFile(this.icsContent()!);
    this.setConversionState('success');
    if (
      isPlatformBrowser(this.platformId) &&
      !sessionStorage.getItem('contribution-nudge-dismissed')
    ) {
      this.showContributionNudge.set(true);
    }
  }

  protected dismissContributionNudge(): void {
    this.showContributionNudge.set(false);
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('contribution-nudge-dismissed', '1');
    }
  }

  protected onExtractionConfirmed(checked: boolean): void {
    this.extractionConfirmed.set(checked);
    this.calendarStateService.extractionConfirmed.set(checked);
  }

  protected resetState(): void {
    this.revokeAllThumbnailUrls();
    this.files.set([]);
    this.batchFiles.set([]);
    this.isDragging.set(false);
    this.setConversionState('idle');
    this.isBatchMode.set(false);
    this.toastService.clearAll();
    this.extractedEvents.set([]);
    this.icsContent.set(null);
    // Reset download confirmation when state is reset
    this.extractionConfirmed.set(false);
    // Hide contribution nudge on reset
    this.showContributionNudge.set(false);
    // Clear all persisted state and calendar
    this.calendarStateService.clearState();
  }

  /**
   * Retry a failed file in batch mode
   */
  protected async retryFile(index: number): Promise<void> {
    const batchFile = this.batchFiles()[index];
    if (!batchFile) return;

    this.setConversionState('processing');

    // Reset file status
    this.batchFiles.update((files) =>
      files.map((f, i) =>
        i === index ? { ...f, status: BatchFileStatus.PENDING, progress: 0, error: undefined } : f,
      ),
    );

    // Process the file
    await this.processSingleBatchFile(index);

    // Update combined results
    this.combineResults();
  }

  // ⚡ Restore methods required by template
  async signIn(): Promise<void> {
    try {
      await this.authService.signInWithGoogle();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      let message = 'Failed to sign in. Please try again.';
      if (error?.message) message += ` (${error.message})`;
      this.toastService.showError(message);
      this.logger.error('Sign in error', 'Converter', error);
    }
  }

  protected removeFile(index: number): void {
    const file = this.files()[index];
    if (file) this.revokeThumbnailUrl(file);
    this.files.update((current) => current.filter((_, i) => i !== index));
    this.toastService.clearError();
    this.extractedEvents.set([]);
    this.icsContent.set(null);
    if (this.conversionState() !== 'idle') this.setConversionState('idle');
  }

  protected navigateToEventDate(event: CalendarEvent): void {
    const date = event.start instanceof Date ? event.start : new Date(event.start);
    if (!isNaN(date.getTime())) {
      this.calendarStateService.goToDate(date);
    }
  }

  // ⚡ Event editing methods
  protected editEvent(index: number): void {
    this.extractedEvents.update((events) =>
      events.map((event, i) => ({
        ...event,
        isEditing: i === index,
      })),
    );
  }

  protected saveEvent(index: number): void {
    this.extractedEvents.update((events) =>
      events.map((event, i) => ({
        ...event,
        isEditing: i === index ? false : event.isEditing,
      })),
    );
    // Regenerate ICS content with edited events
    this.regenerateIcsContent();
  }

  protected cancelEdit(index: number): void {
    this.extractedEvents.update((events) =>
      events.map((event, i) => ({
        ...event,
        isEditing: i === index ? false : event.isEditing,
      })),
    );
  }

  protected deleteEvent(index: number): void {
    this.extractedEvents.update((events) => events.filter((_, i) => i !== index));
    // Regenerate ICS content with remaining events
    this.regenerateIcsContent();
  }

  protected updateEventField(
    index: number,
    field: keyof CalendarEvent,
    value: string | Date | boolean,
  ): void {
    this.extractedEvents.update((events) =>
      events.map((event, i) =>
        i === index
          ? {
              ...event,
              [field]: value,
            }
          : event,
      ),
    );
  }

  // ⚡ Regenerate ICS content from edited events
  private regenerateIcsContent(): void {
    const events = this.extractedEvents();
    if (events.length === 0) {
      this.icsContent.set(null);
      this.calendarStateService.updateIcsContent(null);
      return;
    }

    const icsContent = generateIcs(events);
    this.icsContent.set(icsContent);
    this.calendarStateService.updateIcsContent(icsContent);
  }

  // ⚡ Calendar View Methods

  /**
   * Open interactive calendar view
   */
  protected openCalendarView(): void {
    this.calendarStateService.showCalendar(this.extractedEvents());
  }

  /**
   * Returns true when the viewport width is in the mobile/tablet range (≤1199px)
   * matching the breakpoint used to show the mobile calendar button in CSS.
   */
  private isMobileDevice(): boolean {
    return isPlatformBrowser(this.platformId) && window.innerWidth <= 1199;
  }
}
