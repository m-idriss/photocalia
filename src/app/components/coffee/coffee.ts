import { Component, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

interface ContributionTier {
  labelKey: string;
  emojiKey: string;
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
      emojiKey: 'coffee.tier.coffee.emoji',
      amountKey: 'coffee.tier.coffee.amount',
      url: environment.contribution?.coffeeUrl ?? 'https://ko-fi.com/photocalia',
    },
    {
      labelKey: 'coffee.tier.snack.label',
      emojiKey: 'coffee.tier.snack.emoji',
      amountKey: 'coffee.tier.snack.amount',
      url: environment.contribution?.snackUrl ?? 'https://ko-fi.com/photocalia',
    },
    {
      labelKey: 'coffee.tier.meal.label',
      emojiKey: 'coffee.tier.meal.emoji',
      amountKey: 'coffee.tier.meal.amount',
      url: environment.contribution?.mealUrl ?? 'https://ko-fi.com/photocalia',
    },
  ];

  protected openTier(url: string): void {
    if (isPlatformBrowser(this.platformId)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
}
