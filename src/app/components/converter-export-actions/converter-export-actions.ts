import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppTooltipDirective } from '../../shared/directives';
import { LocalizeRoutePipe } from '../../shared/pipes/localize-route.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-converter-export-actions',
  imports: [AppTooltipDirective, LocalizeRoutePipe, RouterLink, TranslatePipe],
  templateUrl: './converter-export-actions.html',
  styleUrl: './converter-export-actions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConverterExportActions {
  readonly confirmed = input(false);
  readonly showContributionNudge = input(false);
  readonly confirmedChanged = output<boolean>();
  readonly downloadRequested = output<void>();
  readonly resetRequested = output<void>();
  readonly nudgeDismissed = output<void>();
}
