import {
  Component,
  HostListener,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppTooltipDirective } from '../../shared/directives';
import { ThemeService } from '../../services/theme.service';
import { AuthAwareComponent } from '../base/auth-aware.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, AppTooltipDirective],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header extends AuthAwareComponent {
  private readonly themeService = inject(ThemeService);
  private readonly cdr = inject(ChangeDetectorRef);

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

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  changeFontSize() {
    this.themeService.cycleFontSize();
  }

  get currentTheme(): string {
    return this.themeService.getCurrentTheme();
  }

  get currentFontSize(): string {
    return this.themeService.getCurrentFontSize();
  }

  get themeDisplayName(): string {
    return this.themeService.getThemeDisplayName(this.currentTheme);
  }

  get fontSizeDisplayName(): string {
    return this.themeService.getFontSizeDisplayName(this.currentFontSize);
  }

  async signOut(): Promise<void> {
    try {
      await this.authService.signOutUser();
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
}
