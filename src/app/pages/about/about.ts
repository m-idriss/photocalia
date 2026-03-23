import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocalizeRoutePipe } from '../../shared/pipes/localize-route.pipe';
import { ScrollRevealDirective } from '../../shared/directives';

@Component({
  selector: 'app-about',
  imports: [RouterLink, LocalizeRoutePipe, ScrollRevealDirective],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {}
