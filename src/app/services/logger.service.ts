import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private readonly isServer = isPlatformServer(inject(PLATFORM_ID));

  info(message: string, context?: string, data?: unknown): void {
    if (this.isServer) {
      console.log(JSON.stringify({ level: 'info', message, context, timestamp: new Date().toISOString(), data }));
    } else {
      console.log(`[Photocalia]${context ? `[${context}]` : ''}`, message, ...(data !== undefined ? [data] : []));
    }
  }

  warn(message: string, context?: string, data?: unknown): void {
    if (this.isServer) {
      console.warn(JSON.stringify({ level: 'warn', message, context, timestamp: new Date().toISOString(), data }));
    } else {
      console.warn(`[Photocalia]${context ? `[${context}]` : ''}`, message, ...(data !== undefined ? [data] : []));
    }
  }

  error(message: string, context?: string, data?: unknown): void {
    if (this.isServer) {
      console.error(JSON.stringify({ level: 'error', message, context, timestamp: new Date().toISOString(), data }));
    } else {
      console.error(`[Photocalia]${context ? `[${context}]` : ''}`, message, ...(data !== undefined ? [data] : []));
    }
  }
}
