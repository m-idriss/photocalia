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
import { CalendarStateService } from '../../services/calendar-state.service';
import { LanguageService, SupportedLanguage } from '../../services/language.service';
import { LoggerService } from '../../services/logger.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { LocalizeRoutePipe } from '../../shared/pipes/localize-route.pipe';

@Component({
  selector: 'app-header',
  imports: [RouterLink, AppTooltipDirective, TranslatePipe, LocalizeRoutePipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header extends AuthAwareComponent {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly converterService = inject(ConverterService);
  private readonly calendarStateService = inject(CalendarStateService);
  private readonly logger = inject(LoggerService);
  readonly lang = inject(LanguageService);

  menuOpen = false;
  private failedAvatar: { uid: string; photoURL: string } | null = null;

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
      // Clear calendar state and quota cache on logout
      this.calendarStateService.clearState();
      try {
        this.converterService.clearQuotaCache();
      } catch {
        /* ignore */
      }
      this.menuOpen = false;
      this.cdr.markForCheck();
    } catch (error) {
      this.logger.error('Sign out error', 'Header', error);
    }
  }

  async signIn(): Promise<void> {
    try {
      await this.authService.signInWithGoogle();
      this.cdr.markForCheck();
    } catch (error) {
      this.logger.error('Sign in error', 'Header', error);
    }
  }

  setLanguage(lang: SupportedLanguage): void {
    this.lang.setLanguage(lang);
    this.cdr.markForCheck();
  }

  protected shouldShowAvatarImage(): boolean {
    const user = this.currentUser;
    if (!user?.photoURL) return false;
    return this.failedAvatar?.uid !== user.uid || this.failedAvatar?.photoURL !== user.photoURL;
  }

  protected userInitials(): string {
    const user = this.currentUser;
    const source = user?.displayName || user?.email || 'User';
    const parts = source
      .trim()
      .split(/[\s@._-]+/)
      .filter(Boolean);

    const initials = parts
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');

    return initials || 'U';
  }

  protected onAvatarError(): void {
    const user = this.currentUser;
    if (user?.photoURL) {
      this.failedAvatar = { uid: user.uid, photoURL: user.photoURL };
    }
    this.cdr.markForCheck();
  }
}
