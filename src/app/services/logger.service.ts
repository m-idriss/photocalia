import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private readonly isServer = isPlatformServer(inject(PLATFORM_ID));

  info(message: string, context?: string, data?: unknown): void {
    if (this.isServer) {
      console.log(
        JSON.stringify({
          level: 'info',
          message,
          context,
          timestamp: new Date().toISOString(),
          data,
        }),
      );
    } else {
      console.log(
        `[Photocalia]${context ? `[${context}]` : ''}`,
        message,
        ...(data !== undefined ? [data] : []),
      );
      this.sendToServer('info', message, context, data);
    }
  }

  warn(message: string, context?: string, data?: unknown): void {
    if (this.isServer) {
      console.warn(
        JSON.stringify({
          level: 'warn',
          message,
          context,
          timestamp: new Date().toISOString(),
          data,
        }),
      );
    } else {
      console.warn(
        `[Photocalia]${context ? `[${context}]` : ''}`,
        message,
        ...(data !== undefined ? [data] : []),
      );
      this.sendToServer('warn', message, context, data);
    }
  }

  error(message: string, context?: string, data?: unknown): void {
    if (this.isServer) {
      console.error(
        JSON.stringify({
          level: 'error',
          message,
          context,
          timestamp: new Date().toISOString(),
          data,
        }),
      );
    } else {
      console.error(
        `[Photocalia]${context ? `[${context}]` : ''}`,
        message,
        ...(data !== undefined ? [data] : []),
      );
      this.sendToServer('error', message, context, data);
    }
  }

  private sendToServer(
    level: 'info' | 'error' | 'warn',
    message: string,
    context?: string,
    data?: unknown,
  ): void {
    try {
      fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, message, context, data }),
      }).catch(() => undefined);
    } catch {
      // Silently ignore — logging should never break the app
    }
  }
}
