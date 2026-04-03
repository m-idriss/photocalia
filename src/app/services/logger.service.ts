import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private readonly isServer = isPlatformServer(inject(PLATFORM_ID));
  private readonly isVercel =
    environment.production &&
    typeof window !== 'undefined' &&
    window.location.hostname.includes('photocalia');

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
      this.sendToServer('error', message, context, data);
    }
  }

  private sendToServer(
    level: 'info' | 'error' | 'warn',
    message: string,
    context?: string,
    data?: unknown,
  ): void {
    if (!this.isVercel) return;
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
