import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

/** Illustrative sample, independent from the user's uploaded files and calendar. */
@Component({
  selector: 'app-planning-preview',
  imports: [TranslatePipe],
  templateUrl: './planning-preview.html',
  styleUrl: './planning-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanningPreview {}
