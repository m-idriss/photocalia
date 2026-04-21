import { Component, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { DonationService } from '../../services/donation.service';
import { DONATION_PRODUCTS } from '../../constants';
import { ProductId } from '../../models';

@Component({
  selector: 'app-donation-buttons',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './donation-buttons.html',
  styleUrl: './donation-buttons.scss',
})
export class DonationButtons {
  protected readonly products = DONATION_PRODUCTS;
  protected readonly isLoading = signal<ProductId | null>(null);

  private readonly donationService = inject(DonationService);
  private readonly platformId = inject(PLATFORM_ID);

  protected donate(productId: ProductId): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.isLoading.set(productId);

    this.donationService.checkout(productId).subscribe({
      next: (response) => {
        this.isLoading.set(null);
        this.donationService.redirectToCheckout(response.sessionUrl);
      },
      error: () => {
        this.isLoading.set(null);
      },
    });
  }
}
