import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { Home } from './home';
import { AuthService } from '../../services/auth.service';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render hero section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hero-section')).toBeTruthy();
  });

  it('should render converter component', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-converter')).toBeTruthy();
  });

  it('should render hero article cards for signed-out users', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.hero-blog-strip')).toBeTruthy();
    expect(compiled.querySelector('.hero-blog-card')).toBeTruthy();
  });

  it('should render the seasonal campaign video for signed-out users', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const video = compiled.querySelector<HTMLVideoElement>('.campaign-video');

    expect(video).toBeTruthy();
    expect(video?.querySelector('source')?.getAttribute('src')).toContain(
      '/assets/videos/photocalia-summer-campaign-',
    );
  });

  it('should hide marketing sections for authenticated users', () => {
    const authService = TestBed.inject(AuthService);
    authService.isAuthenticated.set(true);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.marketing-sections')).toBeFalsy();
  });

  it('should hide scrolling hero article cards for authenticated users', () => {
    const authService = TestBed.inject(AuthService);
    authService.isAuthenticated.set(true);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hero-blog-strip')).toBeFalsy();
    expect(compiled.querySelector('.hero-blog-card')).toBeFalsy();
  });
});
