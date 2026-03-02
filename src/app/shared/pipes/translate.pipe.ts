import { Pipe, PipeTransform, inject, ChangeDetectorRef } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';

/**
 * Pipe that translates a key into the current language.
 * Impure so it re-evaluates when the language changes.
 *
 * Usage: {{ 'home.hero.title' | translate }}
 */
@Pipe({
  name: 'translate',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly languageService = inject(LanguageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly sub: Subscription;

  constructor() {
    // Subscribe to translations loading so impure pipe re-evaluates after
    // the async HTTP fetch completes (not just when currentLang changes).
    this.sub = toObservable(this.languageService.translations).subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  transform(key: string): string {
    return this.languageService.translate(key);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
