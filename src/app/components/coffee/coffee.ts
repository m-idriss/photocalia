import { Component, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { DEFAULT_CONTRIBUTION_URLS } from '../../constants';

interface ContributionTier {
  labelKey: string;
  emoji: string;
  amountKey: string;
  url: string;
}

@Component({
  selector: 'app-coffee',
  imports: [TranslatePipe],
  templateUrl: './coffee.html',
  styleUrl: './coffee.scss',
})
export class Coffee {
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly tiers: ContributionTier[] = [
    {
      labelKey: 'coffee.tier.coffee.label',
      emoji: '☕',
      amountKey: 'coffee.tier.coffee.amount',
      url: environment.contribution?.coffeeUrl ?? DEFAULT_CONTRIBUTION_URLS.coffeeUrl,
    },
    {
      labelKey: 'coffee.tier.snack.label',
      emoji: '🍪',
      amountKey: 'coffee.tier.snack.amount',
      url: environment.contribution?.snackUrl ?? DEFAULT_CONTRIBUTION_URLS.snackUrl,
    },
    {
      labelKey: 'coffee.tier.meal.label',
      emoji: '🍕',
      amountKey: 'coffee.tier.meal.amount',
      url: environment.contribution?.mealUrl ?? DEFAULT_CONTRIBUTION_URLS.mealUrl,
    },
  ];

  protected openTier(url: string): void {
    if (isPlatformBrowser(this.platformId)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
}
