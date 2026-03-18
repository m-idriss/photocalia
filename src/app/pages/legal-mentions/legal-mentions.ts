import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocalizeRoutePipe } from '../../shared/pipes/localize-route.pipe';

@Component({
  selector: 'app-legal-mentions',
  imports: [RouterLink, LocalizeRoutePipe],
  templateUrl: './legal-mentions.html',
  styleUrl: './legal-mentions.scss',
})
export class LegalMentions {}
