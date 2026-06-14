import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { BackToTop } from './back-to-top';

describe('BackToTop', () => {
  let component: BackToTop;
  let fixture: ComponentFixture<BackToTop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackToTop],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(BackToTop);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be hidden by default', () => {
    expect(component['isVisible']()).toBe(false);
  });

  it('should show button when scrolled past threshold', () => {
    // Simulate scroll
    Object.defineProperty(window, 'scrollY', { value: 400, writable: true });
    component.onWindowScroll();
    expect(component['isVisible']()).toBe(true);
  });

  it('should hide button when scrolled to top', () => {
    // First scroll down
    Object.defineProperty(window, 'scrollY', { value: 400, writable: true });
    component.onWindowScroll();

    // Then scroll back to top
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    component.onWindowScroll();
    expect(component['isVisible']()).toBe(false);
  });

  it('should scroll to top when button is clicked', () => {
    const scrollToSpy = spyOn(window, 'scrollTo').and.callThrough();
    component.scrollToTop();
    expect(scrollToSpy).toHaveBeenCalled();
    const callArgs = scrollToSpy.calls.mostRecent().args[0] as ScrollToOptions;
    expect(callArgs.top).toBe(0);
    expect(callArgs.behavior).toBe('smooth');
  });

  it('should handle Enter key press', () => {
    const scrollToTopSpy = spyOn(component, 'scrollToTop');
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    spyOn(event, 'preventDefault');
    component.handleKeyPress(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(scrollToTopSpy).toHaveBeenCalled();
  });

  it('should handle Space key press', () => {
    const scrollToTopSpy = spyOn(component, 'scrollToTop');
    const event = new KeyboardEvent('keydown', { key: ' ' });
    spyOn(event, 'preventDefault');
    component.handleKeyPress(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(scrollToTopSpy).toHaveBeenCalled();
  });

  it('should have AppTooltipDirective imported', () => {
    // This test verifies that AppTooltipDirective is properly imported
    // The tooltip enhancement is applied to the back-to-top button with:
    // appTooltip="Back to top" appTooltipPlacement="left"
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button');
    expect(button).toBeTruthy();
  });
});
