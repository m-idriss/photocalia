import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AppTooltipDirective } from '../../shared/directives';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

export interface ConverterPreviewFile {
  file: File;
  url: string;
}

@Component({
  selector: 'app-converter-upload',
  imports: [AppTooltipDirective, TranslatePipe],
  templateUrl: './converter-upload.html',
  styleUrl: './converter-upload.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConverterUpload {
  readonly files = input.required<readonly File[]>();
  readonly thumbnailUrls = input.required<ReadonlyMap<File, string>>();
  readonly preview = input<ConverterPreviewFile | null>(null);
  readonly dragging = input(false);
  readonly processing = input(false);

  readonly fileSelectionChanged = output<Event>();
  readonly dragOver = output<DragEvent>();
  readonly dragLeave = output<DragEvent>();
  readonly filesDropped = output<DragEvent>();
  readonly removeRequested = output<number>();
  readonly previewRequested = output<File>();
  readonly previewClosed = output<void>();
  readonly conversionRequested = output<void>();

  protected isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  protected thumbnail(file: File): string {
    return this.thumbnailUrls().get(file) ?? '';
  }
}
