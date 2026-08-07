import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { CalendarEvent } from '../../models';
import {
  formatCalendarEventInput,
  getEventColor,
  getMonthDay,
  parseCalendarEventInput,
} from '../../utils';
import { AppTooltipDirective } from '../../shared/directives';

export interface EventFieldChange {
  index: number;
  field: keyof CalendarEvent;
  value: string | Date | boolean;
}

@Component({
  selector: 'app-converter-event-review',
  imports: [CommonModule, NgbAccordionModule, AppTooltipDirective],
  templateUrl: './converter-event-review.html',
  styleUrl: './converter-event-review.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConverterEventReview {
  readonly events = input.required<readonly CalendarEvent[]>();
  readonly openCalendarRequested = output<void>();
  readonly eventDateRequested = output<CalendarEvent>();
  readonly editRequested = output<number>();
  readonly deleteRequested = output<number>();
  readonly saveRequested = output<number>();
  readonly cancelRequested = output<number>();
  readonly fieldChanged = output<EventFieldChange>();

  protected readonly getEventColor = getEventColor;
  protected readonly formatDateForInput = formatCalendarEventInput;
  protected readonly parseDateFromInput = parseCalendarEventInput;

  protected monthDay(value: string | Date): string {
    if (typeof value === 'string') return getMonthDay(value);
    const day = String(value.getDate()).padStart(2, '0');
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const year = value.getFullYear();
    const hours = String(value.getHours()).padStart(2, '0');
    const minutes = String(value.getMinutes()).padStart(2, '0');
    return getMonthDay(`${day}/${month}/${year} ${hours}:${minutes}`);
  }

  protected time(value: string | Date): string {
    const date = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return '';
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  protected changeField(
    index: number,
    field: keyof CalendarEvent,
    value: string | Date | boolean,
  ): void {
    this.fieldChanged.emit({ index, field, value });
  }
}
