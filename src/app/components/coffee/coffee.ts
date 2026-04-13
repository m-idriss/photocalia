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
      url: environment.contribution?.coffeeUrl ?? 'https://buy.stripe.com/4gM4gA09TalwgRAd7m4Vy01',
    },
    {
      labelKey: 'coffee.tier.snack.label',
      emojiKey: 'coffee.tier.snack.emoji',
      amountKey: 'coffee.tier.snack.amount',
      url: environment.contribution?.snackUrl ?? 'https://buy.stripe.com/3cI3cw3m565g9p82sI4Vy00',
    },
    {
      labelKey: 'coffee.tier.meal.label',
      emojiKey: 'coffee.tier.meal.emoji',
      amountKey: 'coffee.tier.meal.amount',
      url: environment.contribution?.mealUrl ?? 'https://buy.stripe.com/28E28s1dX79keJs1oE4Vy02',
    },
  ];

  protected openTier(url: string): void {
    if (isPlatformBrowser(this.platformId)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
}
