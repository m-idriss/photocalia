import { Pipe, PipeTransform, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';

/**
 * Pipe that formats dates based on the current language.
 * English: YYYY-MM-DD
 * French: DD-MM-YYYY
 *
 * Usage: {{ '2026-06-12' | localizeDate }}
 */
@Pipe({
  name: 'localizeDate',
  standalone: true,
  pure: false,
})
export class LocalizeDatePipe implements PipeTransform, OnDestroy {
  private readonly languageService = inject(LanguageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly sub: Subscription;

  constructor() {
    this.sub = toObservable(this.languageService.currentLang).subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  transform(dateString: string | null | undefined): string {
    if (!dateString) {
      return '';
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    const parts = dateString.split('-');
    const [year, month, day] = parts;
    const currentLang = this.languageService.currentLang();

    if (currentLang === 'fr') {
      // French format: DD-MM-YYYY
      return `${day}-${month}-${year}`;
    }

    // English format: YYYY-MM-DD (no change)
    return dateString;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
