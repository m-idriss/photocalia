import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocalizeRoutePipe } from '../../shared/pipes/localize-route.pipe';

@Component({
  selector: 'app-about',
  imports: [RouterLink, LocalizeRoutePipe],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {}
