import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Coffee } from './coffee';

describe('Coffee', () => {
  let component: Coffee;
  let fixture: ComponentFixture<Coffee>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Coffee],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Coffee);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render 3 contribution tiers', () => {
    const tiers = fixture.nativeElement.querySelectorAll('.coffee-tier');
    expect(tiers.length).toBe(3);
  });

  it('should display the section heading', () => {
    const heading = fixture.nativeElement.querySelector('.coffee-heading');
    expect(heading).toBeTruthy();
  });

  it('should render tier emoji, label and amount for each tier', () => {
    const tiers = fixture.nativeElement.querySelectorAll('.coffee-tier');
    tiers.forEach((tier: HTMLElement) => {
      expect(tier.querySelector('.tier-emoji')).toBeTruthy();
      expect(tier.querySelector('.tier-label')).toBeTruthy();
      expect(tier.querySelector('.tier-amount')).toBeTruthy();
    });
  });

  it('should have accessible aria attributes on the tiers container', () => {
    const list = fixture.nativeElement.querySelector('.coffee-tiers');
    expect(list.getAttribute('role')).toBe('group');
  });

  it('should expose 3 tiers in component', () => {
    expect(component['tiers'].length).toBe(3);
  });

  it('should open the tier URL in a new tab when openTier is called', () => {
    const openSpy = spyOn(window, 'open');
    const testUrl = 'https://buy.stripe.com/test_123';
    component['openTier'](testUrl);
    expect(openSpy).toHaveBeenCalledWith(testUrl, '_blank', 'noopener,noreferrer');
  });

  it('should open the tier URL when a tier button is clicked', () => {
    const openSpy = spyOn(window, 'open');
    const firstTierButton = fixture.nativeElement.querySelector(
      '.coffee-tier',
    ) as HTMLButtonElement;
    firstTierButton.click();
    expect(openSpy).toHaveBeenCalledWith(
      component['tiers'][0].url,
      '_blank',
      'noopener,noreferrer',
    );
  });
});
