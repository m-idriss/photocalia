import {
  Component,
  HostListener,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { RouterLink } from '@angular/router';
import { AuthAwareComponent } from '../base/auth-aware.component';
import { ConverterService } from '../../services/converter';
import { CalendarStateService } from '../../services/calendar-state.service';
import { LanguageService, SupportedLanguage } from '../../services/language.service';
import { ToastService } from '../../services/toast.service';
import { authErrorMessageKey } from '../../utils/auth-error.utils';
import { LoggerService } from '../../services/logger.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { LocalizeRoutePipe } from '../../shared/pipes/localize-route.pipe';

@Component({
  selector: 'app-header',
  imports: [RouterLink, TranslatePipe, LocalizeRoutePipe, A11yModule, UpperCasePipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header extends AuthAwareComponent {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly converterService = inject(ConverterService);
  private readonly calendarStateService = inject(CalendarStateService);
  private readonly logger = inject(LoggerService);
  private readonly toast = inject(ToastService);
  readonly lang = inject(LanguageService);
  private readonly element = inject(ElementRef<HTMLElement>);
  @ViewChild('menuButton') private menuButton?: ElementRef<HTMLButtonElement>;

  menuOpen = false;
  scrolled = false;
  private failedAvatar: { uid: string; photoURL: string } | null = null;

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.scrolled = window.scrollY > 32;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(restoreFocus = false): void {
    this.menuOpen = false;
    if (restoreFocus) this.menuButton?.nativeElement.focus();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!this.element.nativeElement.contains(target) && this.menuOpen) {
      this.closeMenu(true);
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.menuOpen) {
      this.closeMenu(true);
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
      this.toast.showError(this.lang.translate(authErrorMessageKey(error)));
      this.logger.error('Sign in error', 'Header', error);
    }
  }

  onLanguageClick(event: MouseEvent, lang: SupportedLanguage): void {
    // Keep native new-tab behavior; ordinary clicks preserve the in-memory converter state.
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    this.setLanguage(lang);
  }

  setLanguage(lang: SupportedLanguage): void {
    this.closeMenu();
    this.lang.setLanguage(lang);
    this.cdr.markForCheck();
  }

  protected shouldShowAvatarImage(): boolean {
    const user = this.currentUser;
    if (!user?.photoURL) return false;
    return (
      !this.failedAvatar ||
      this.failedAvatar.uid !== user.uid ||
      this.failedAvatar.photoURL !== user.photoURL
    );
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
