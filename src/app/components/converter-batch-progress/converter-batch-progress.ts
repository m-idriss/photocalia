import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NgbCollapseModule, NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { BatchFile, BatchFileStatus } from '../../models';
import { AppTooltipDirective } from '../../shared/directives';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-converter-batch-progress',
  imports: [AppTooltipDirective, NgbCollapseModule, NgbProgressbarModule, TranslatePipe],
  templateUrl: './converter-batch-progress.html',
  styleUrl: './converter-batch-progress.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConverterBatchProgress {
  readonly files = input.required<readonly BatchFile[]>();
  readonly processing = input(false);
  readonly batchMode = input(false);
  readonly collapsed = input(false);
  readonly collapsedChanged = output<boolean>();
  readonly retryRequested = output<number>();

  protected readonly status = BatchFileStatus;
  protected readonly stats = computed(() => {
    const files = this.files();
    return {
      total: files.length,
      success: files.filter(({ status }) => status === BatchFileStatus.SUCCESS).length,
      error: files.filter(({ status }) => status === BatchFileStatus.ERROR).length,
      processing: files.filter(({ status }) => status === BatchFileStatus.PROCESSING).length,
    };
  });
  protected readonly progress = computed(() => {
    const { total, success, error } = this.stats();
    return total === 0 ? 0 : Math.round(((success + error) / total) * 100);
  });

  protected toggleDetails(): void {
    this.collapsedChanged.emit(!this.collapsed());
  }
}
