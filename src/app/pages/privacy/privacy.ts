import { DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-privacy',
  imports: [],
  templateUrl: './privacy.html',
  styleUrl: './privacy.scss',
})
export class Privacy {
  private readonly document = inject(DOCUMENT);

  protected readonly isFrench = this.document.location?.pathname.startsWith('/fr') ?? false;
}
