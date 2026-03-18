import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocalizeRoutePipe } from '../../shared/pipes/localize-route.pipe';

@Component({
  selector: 'app-terms',
  imports: [RouterLink, LocalizeRoutePipe],
  templateUrl: './terms.html',
  styleUrl: './terms.scss',
})
export class Terms {}
