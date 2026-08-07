import { Injectable } from '@angular/core';
import { CALENDAR_CONFIG } from '../constants';

@Injectable({ providedIn: 'root' })
export class IcsExportService {
  download(icsContent: string, filename: string = CALENDAR_CONFIG.DEFAULT_ICS_FILENAME): void {
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
