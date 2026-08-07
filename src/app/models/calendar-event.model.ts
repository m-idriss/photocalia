/**
 * Calendar event model for converter functionality
 */
export interface CalendarEvent {
  summary: string;
  start: string | Date;
  end: string | Date;
  location?: string;
  description?: string;
  allDay?: boolean;
  isEditing?: boolean; // Track if event is currently being edited
  showActions?: boolean; // Track if action menu is shown
}
