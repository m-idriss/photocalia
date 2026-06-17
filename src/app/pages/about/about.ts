import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocalizeRoutePipe } from '../../shared/pipes/localize-route.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { ScrollRevealDirective } from '../../shared/directives';
import { Coffee } from '../../components/coffee/coffee';

@Component({
  selector: 'app-about',
  imports: [RouterLink, LocalizeRoutePipe, TranslatePipe, ScrollRevealDirective, Coffee],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {}
