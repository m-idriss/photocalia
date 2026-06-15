import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { LocalizeRoutePipe } from '../../shared/pipes/localize-route.pipe';

@Component({
  selector: 'app-donation-success',
  imports: [RouterLink, TranslatePipe, LocalizeRoutePipe],
  templateUrl: './donation-success.html',
  styleUrl: './donation-success.scss',
})
export class DonationSuccess {}
