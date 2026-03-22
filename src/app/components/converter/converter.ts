import {
  Component,
  signal,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  effect,
  untracked,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import ICAL from '../../libs/ical-wrapper'; // ⚡ Wrapper to ensure parse() exists
import {
  NgbAccordionModule,
  NgbCollapseModule,
  NgbPopoverModule,
  NgbProgressbarModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { AppTooltipDirective } from '../../shared/directives';

import { ConverterService, FileData } from '../../services/converter';
import { ToastService } from '../../services/toast.service';
import { CalendarStateService } from '../../services/calendar-state.service';
import { Card } from '../card/card';
import { AuthAwareComponent } from '../base/auth-aware.component';
import { CalendarEvent, BatchFile, BatchFileStatus } from '../../models';
import { FILE_UPLOAD_CONSTRAINTS } from '../../constants';
import { getMonthDay, getEventColor } from '../../utils';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-converter',
  imports: [
    Card,
    FormsModule,
    CommonModule,
    NgbAccordionModule,
    NgbCollapseModule,
    AppTooltipDirective,
    NgbPopoverModule,
    NgbProgressbarModule,
    NgbTooltipModule,
    TranslatePipe,
  ],
  templateUrl: './converter.html',
  styleUrl: './converter.scss',
})
export class Converter extends AuthAwareComponent implements OnInit {
  protected readonly files = signal<File[]>([]);
  protected readonly batchFiles = signal<BatchFile[]>([]); // Batch processing state
  protected readonly isDragging = signal(false);
  protected readonly isProcessing = signal(false);
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
  protected readonly showDownloadConfirm = signal(false);

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
          this.showDownloadConfirm.set(false);
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

  // Computed values for batch processing
  protected readonly batchProgress = computed(() => {
    const batch = this.batchFiles();
    if (batch.length === 0) return 0;
    const completed = batch.filter(
      (f) => f.status === BatchFileStatus.SUCCESS || f.status === BatchFileStatus.ERROR,
    ).length;
    return Math.round((completed / batch.length) * 100);
  });

  protected readonly batchStats = computed(() => {
    const batch = this.batchFiles();
    return {
      total: batch.length,
      success: batch.filter((f) => f.status === BatchFileStatus.SUCCESS).length,
      error: batch.filter((f) => f.status === BatchFileStatus.ERROR).length,
      processing: batch.filter((f) => f.status === BatchFileStatus.PROCESSING).length,
      pending: batch.filter((f) => f.status === BatchFileStatus.PENDING).length,
    };
  });

  // Expose BatchFileStatus enum to template
  protected readonly BatchFileStatus = BatchFileStatus;

  private readonly converterService = inject(ConverterService);
  private readonly toastService = inject(ToastService);
  protected readonly calendarStateService = inject(CalendarStateService);
  private readonly platformId = inject(PLATFORM_ID);

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
    }
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
        console.error('Failed to fetch quota status:', error);
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
          console.error('Error handling shared files:', error);
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

    if (validFiles.length) this.files.update((current) => [...current, ...validFiles]);
  }

  protected async convertToIcs(): Promise<void> {
    if (!this.files().length) {
      this.toastService.showError('Please add at least one file.');
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
    this.isProcessing.set(true);
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
            this.toastService.showError(response.error || 'Failed to convert files.');
          }
          this.isProcessing.set(false);
        },
        error: (err) => {
          // Check for quota exceeded error (HTTP 429)
          if (err.status === 429) {
            const errorMsg =
              err.error?.error ||
              'Monthly conversion limit reached. Please try again later or contact us to upgrade.';
            this.toastService.showError(errorMsg);
            // Refresh quota to show updated count
            this.fetchQuotaStatus();
          } else {
            this.toastService.showError(err.error?.message || err.message || 'Conversion error.');
          }
          this.isProcessing.set(false);
        },
      });
    } catch (err) {
      this.toastService.showError((err as Error).message || 'Failed to process files.');
      this.isProcessing.set(false);
    }
  }

  /**
   * Convert files one by one with progress tracking (batch mode)
   */
  private async convertBatch(): Promise<void> {
    this.isProcessing.set(true);
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
    this.isProcessing.set(false);
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
                        error: response.error || 'Failed to convert file.',
                      }
                    : f,
                ),
              );
              resolve();
            }
          },
          error: (err) => {
            // Check for quota exceeded error (HTTP 429)
            const errorMsg =
              err.status === 429
                ? err.error?.error ||
                  'Monthly conversion limit reached. Please try again later or contact us to upgrade.'
                : err.error?.message || err.message || 'Conversion error.';

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
            if (err.status === 429) {
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

  /**
   * Combine results from all batch files
   */
  private combineResults(): void {
    const successfulFiles = this.batchFiles().filter((f) => f.status === BatchFileStatus.SUCCESS);

    if (successfulFiles.length === 0) {
      this.toastService.showError('All files failed to process. Please try again.');
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

    // Automatically show calendar view when events are extracted
    if (allEvents.length > 0 && isPlatformBrowser(this.platformId)) {
      this.openCalendarView();
    }
  }

  /**
   * Parse ICS content and return array of events (without updating state)
   */
  private parseIcsContentToEvents(icsContent: string): CalendarEvent[] {
    try {
      const cleanIcs = this.sanitizeIcs(icsContent);
      const jcalData = ICAL.parse(cleanIcs);
      const calendar = new ICAL.Component(jcalData);
      // ICAL.js doesn't have proper TypeScript types
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vevents: any[] = calendar.getAllSubcomponents('vevent');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return vevents.map((vevent: any) => {
        const eventComp = new ICAL.Event(vevent);
        return {
          summary: eventComp.summary,
          description: eventComp.description,
          location: eventComp.location,
          start: eventComp.startDate.toJSDate(),
          end: eventComp.endDate.toJSDate(),
        };
      });
    } catch (error) {
      console.error('Failed to parse ICS:', error);
      return [];
    }
  }

  // ⚡ Parse ICS content using ical.js wrapper (works dev + prod)
  private parseIcsContent(icsContent: string): void {
    try {
      const repaired = this.repairIcsContent(icsContent);
      const jcalData = ICAL.parse(repaired);
      const calendar = new ICAL.Component(jcalData);
      const vevents = calendar.getAllSubcomponents('vevent');

      // ICAL.js doesn't have proper TypeScript types
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const events: CalendarEvent[] = vevents.map((vevent: any) => {
        const eventComp = new ICAL.Event(vevent);
        return {
          summary: eventComp.summary,
          description: eventComp.description,
          location: eventComp.location,
          start: eventComp.startDate.toJSDate(),
          end: eventComp.endDate.toJSDate(),
        };
      });

      events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

      this.extractedEvents.set(events);
      // Persist ICS content for restore on refresh
      this.calendarStateService.updateIcsContent(this.icsContent());
      this.toastService.showSuccess(
        `Successfully extracted ${events.length} event(s) from your file!`,
      );
      this.toastService.clearError();

      // Automatically show calendar view when events are extracted
      if (isPlatformBrowser(this.platformId)) {
        this.openCalendarView();
      }
    } catch (error) {
      console.error('Failed to parse repaired ICS:', error);
      this.toastService.showError('Failed to parse generated ICS file (even after repair).');
      this.toastService.clearSuccess();
      this.extractedEvents.set([]);
    }
  }

  protected downloadIcs(): void {
    if (!this.icsContent()) return;

    if (!this.extractionConfirmed()) {
      this.showDownloadConfirm.set(true);
      return;
    }

    this.converterService.downloadIcsFile(this.icsContent()!);
  }

  protected confirmAndDownload(checked: boolean): void {
    this.extractionConfirmed.set(checked);
    this.calendarStateService.extractionConfirmed.set(checked);
    if (checked) {
      this.showDownloadConfirm.set(false);
      if (this.icsContent()) {
        this.converterService.downloadIcsFile(this.icsContent()!);
      }
    }
  }

  protected resetState(): void {
    this.files.set([]);
    this.batchFiles.set([]);
    this.isDragging.set(false);
    this.isProcessing.set(false);
    this.isBatchMode.set(false);
    this.toastService.clearAll();
    this.extractedEvents.set([]);
    this.icsContent.set(null);
    // Reset download confirmation when state is reset
    this.extractionConfirmed.set(false);
    this.showDownloadConfirm.set(false);
    // Clear all persisted state and calendar
    this.calendarStateService.clearState();
  }

  /**
   * Retry a failed file in batch mode
   */
  protected async retryFile(index: number): Promise<void> {
    const batchFile = this.batchFiles()[index];
    if (!batchFile) return;

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
      console.error('Sign in error:', error);
    }
  }

  protected removeFile(index: number): void {
    this.files.update((current) => current.filter((_, i) => i !== index));
    this.toastService.clearError();
    this.extractedEvents.set([]);
    this.icsContent.set(null);
  }

  protected getEventColor = getEventColor;

  protected navigateToEventDate(event: CalendarEvent): void {
    const date = event.start instanceof Date ? event.start : new Date(event.start);
    if (!isNaN(date.getTime())) {
      this.calendarStateService.goToDate(date);
    }
  }

  protected getMonthDay(dateStr: string | Date): string {
    if (typeof dateStr === 'string') {
      return getMonthDay(dateStr);
    } else {
      // Convert Date object to "DD/MM/YYYY HH:MM" format expected by utility
      const day = dateStr.getDate().toString().padStart(2, '0');
      const month = (dateStr.getMonth() + 1).toString().padStart(2, '0');
      const year = dateStr.getFullYear();
      const hours = dateStr.getHours().toString().padStart(2, '0');
      const minutes = dateStr.getMinutes().toString().padStart(2, '0');
      const formattedStr = `${day}/${month}/${year} ${hours}:${minutes}`;
      return getMonthDay(formattedStr);
    }
  }

  protected getTime(dateStr: string | Date): string {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
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

    // Generate ICS content manually
    let icsContent = 'BEGIN:VCALENDAR\r\n';
    icsContent += 'VERSION:2.0\r\n';
    icsContent += 'PRODID:-//PhotoCalia Calendar Converter//EN\r\n';
    icsContent += 'CALSCALE:GREGORIAN\r\n';

    events.forEach((event) => {
      icsContent += 'BEGIN:VEVENT\r\n';
      icsContent += `UID:${Date.now()}-${Math.random().toString(36).substr(2, 9)}@photocalia.com\r\n`;
      icsContent += `DTSTAMP:${this.dateToIcsFormat(new Date())}\r\n`;
      icsContent += `DTSTART:${this.dateToIcsFormat(event.start)}\r\n`;
      icsContent += `DTEND:${this.dateToIcsFormat(event.end)}\r\n`;
      icsContent += `SUMMARY:${event.summary}\r\n`;
      if (event.description) {
        icsContent += `DESCRIPTION:${event.description}\r\n`;
      }
      if (event.location) {
        icsContent += `LOCATION:${event.location}\r\n`;
      }
      icsContent += 'END:VEVENT\r\n';
    });

    icsContent += 'END:VCALENDAR\r\n';
    this.icsContent.set(icsContent);
    this.calendarStateService.updateIcsContent(icsContent);
  }

  // ⚡ Convert Date object or string to ICS format (YYYYMMDDTHHMMSSZ)
  private dateToIcsFormat(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const hour = String(d.getUTCHours()).padStart(2, '0');
    const minute = String(d.getUTCMinutes()).padStart(2, '0');
    const second = String(d.getUTCSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hour}${minute}${second}Z`;
  }

  protected formatDateForInput(dateStr: string | Date): string {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  protected parseDateFromInput(dateStr: string): Date {
    return new Date(dateStr);
  }

  private sanitizeIcs(ics: string): string {
    return ics
      .split(/\r?\n/)
      .filter((line) => line.trim() === '' || /^[A-Z-]+[;:]/i.test(line))
      .join('\r\n');
  }

  // 🧹 Sanitize and auto-repair ICS before parsing
  private repairIcsContent(raw: string): string {
    if (!raw) return '';

    let ics = raw
      .replace(/\r\n|\r|\n/g, '\r\n')
      .replace(/[^\x20-\x7E\r\n]/g, '') // retirer les caractères non ASCII imprimables
      .trim();

    ics = ics.replace(/\[\[.*?\]\]/g, '');
    ics = ics.replace(/#+\s*/g, '');

    if (!ics.includes('BEGIN:VCALENDAR')) {
      ics = 'BEGIN:VCALENDAR\r\n' + ics;
    }
    if (!ics.includes('END:VCALENDAR')) {
      ics += '\r\nEND:VCALENDAR';
    }

    ics = ics
      .split(/\r\n/)
      .filter((line) => line.trim() === '' || /^[A-Z0-9-]+[;:]/i.test(line))
      .join('\r\n');

    if (!/VERSION:2\.0/.test(ics)) {
      ics = ics.replace(/BEGIN:VCALENDAR\r\n/, 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\n');
    }
    if (!/PRODID:/.test(ics)) {
      ics = ics.replace(
        /VERSION:2\.0\r\n/,
        'VERSION:2.0\r\nPRODID:-//PhotoCalia Calendar Converter//EN\r\n',
      );
    }

    ics = ics.replace(/\r\n{2,}/g, '\r\n');

    return ics.trim();
  }

  // ⚡ Calendar View Methods

  /**
   * Open interactive calendar view
   */
  protected openCalendarView(): void {
    this.calendarStateService.showCalendar(this.extractedEvents());
  }
}
