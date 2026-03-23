import { Directive, Input, OnInit, inject } from '@angular/core';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

/**
 * Custom tooltip directive that wraps ngbTooltip with consistent configuration
 * across the application. Provides unified styling, placement, and behavior.
 *
 * Usage:
 * <button appTooltip="Click me">Button</button>
 * <button appTooltip="Click me" appTooltipPlacement="left">Button</button>
 *
 * Default configuration:
 * - placement: 'top'
 * - container: 'body'
 * - triggers: 'hover focus'
 */
@Directive({
  selector: '[appTooltip]',
  standalone: true,
  hostDirectives: [
    {
      directive: NgbTooltip,
      inputs: ['ngbTooltip: appTooltip'],
    },
  ],
})
export class AppTooltipDirective implements OnInit {
  private readonly ngbTooltip = inject(NgbTooltip);

  /**
   * Tooltip placement (top, bottom, left, right)
   * Default: 'top'
   */
  @Input() appTooltipPlacement: 'top' | 'bottom' | 'left' | 'right' | 'auto' = 'top';

  ngOnInit(): void {
    // Apply default configuration
    this.ngbTooltip.container = 'body';
    this.ngbTooltip.triggers = 'hover focus';
    this.ngbTooltip.placement = this.appTooltipPlacement;
  }
}
