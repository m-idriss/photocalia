import { Component, Input, output } from '@angular/core';
import { AppTooltipDirective } from '../../shared/directives';

/**
 * Reusable card component providing consistent styling for content sections.
 * Accepts an optional title to display in the card header.
 *
 * @example
 * ```html
 * <app-card title="My Section">
 *   <p>Card content goes here</p>
 * </app-card>
 * ```
 */
@Component({
  selector: 'app-card',
  standalone: true,
  imports: [AppTooltipDirective],
  templateUrl: './card.html',
  styleUrl: './card.scss',
})
export class Card {
  /**
   * Optional title to display in the card header
   */
  @Input() title?: string;

  /**
   * Optional badge count to display next to the title
   */
  @Input() badge?: number;

  /**
   * Whether to show a collapse button in the header
   */
  @Input() showCollapseButton = false;

  /**
   * Event emitted when collapse button is clicked
   */
  readonly collapseClicked = output<void>();

  /**
   * Handle collapse button click
   */
  onCollapseClick(): void {
    this.collapseClicked.emit();
  }
}
