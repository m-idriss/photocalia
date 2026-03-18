import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../../services/language.service';

/**
 * Pipe that prefixes a route path with the current language prefix.
 *
 * Usage: [routerLink]="'/privacy' | localizeRoute"
 *   → '/privacy' (English)
 *   → '/fr/privacy' (French)
 */
@Pipe({
  name: 'localizeRoute',
  standalone: true,
  pure: false,
})
export class LocalizeRoutePipe implements PipeTransform {
  private readonly languageService = inject(LanguageService);

  transform(path: string): string {
    return this.languageService.localizeRoute(path);
  }
}
