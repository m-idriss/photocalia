import {
  Component,
  HostListener,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppTooltipDirective } from '../../shared/directives';
import { AuthAwareComponent } from '../base/auth-aware.component';
import { ConverterService } from '../../services/converter';
import { LanguageService, SupportedLanguage } from '../../services/language.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-header',
  imports: [RouterLink, AppTooltipDirective, TranslatePipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header extends AuthAwareComponent {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly converterService = inject(ConverterService);
  readonly lang = inject(LanguageService);

  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const burgerMenu = target.closest('.burger-menu');
    if (!burgerMenu && this.menuOpen) {
      this.closeMenu();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.menuOpen) {
      this.closeMenu();
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.authService.signOutUser();
      // Clear quota cache immediately so UI doesn't show stale quota after logout
      try { this.converterService.clearQuotaCache(); } catch (e) {}
      this.menuOpen = false;
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  async signIn(): Promise<void> {
    try {
      await this.authService.signInWithGoogle();
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Sign in error:', error);
    }
  }

  setLanguage(lang: SupportedLanguage): void {
    this.lang.setLanguage(lang);
    this.cdr.markForCheck();
  }
}
