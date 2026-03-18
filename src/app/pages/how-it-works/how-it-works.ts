import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { LocalizeRoutePipe } from '../../shared/pipes/localize-route.pipe';

@Component({
  selector: 'app-how-it-works',
  imports: [TranslatePipe, RouterModule, LocalizeRoutePipe],
  templateUrl: './how-it-works.html',
  styleUrl: './how-it-works.scss',
})
export class HowItWorks {}
