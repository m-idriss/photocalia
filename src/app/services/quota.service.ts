import { Injectable, effect, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Observable, catchError, from, map, of, switchMap } from 'rxjs';
import { QuotaStatus, QuotaStatusResponse } from '../models/converter-api.model';
import { AuthService } from './auth.service';
import { ConverterApiClient } from './converter-api-client.service';

type UnknownRecord = Record<string, unknown>;

/** Remove this compatibility bridge and its fallback branches by 1 October 2026. */
export const ENABLE_LEGACY_QUOTA_RESPONSE_UNTIL_2026_10_01 = true;

@Injectable({ providedIn: 'root' })
export class QuotaService {
  private readonly authService = inject(AuthService);
  private readonly auth = inject(Auth, { optional: true });
  private readonly api = inject(ConverterApiClient);
  private readonly cacheKey = 'photocalia_quota_cache_v1';
  private readonly cacheTtlMs = 1000 * 60 * 60 * 24;
  private userId = this.determineUserId();

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      const nextId = user?.email ?? user?.uid ?? this.getOrCreateAnonymousId();
      if (nextId === this.userId) return;
      if (!user) this.clearCache();
      this.userId = nextId;
    });
  }

  getUserId(): string {
    return this.userId;
  }

  getStatus(): Observable<QuotaStatusResponse> {
    return from(this.authorizationHeaders()).pipe(
      switchMap((headers) => this.api.getQuotaStatus(this.userId, headers)),
      map((raw) => this.normalize(raw)),
      map((response) => {
        if (response.success) this.saveCache(response);
        return response;
      }),
      catchError((error) => {
        const cached = this.loadCache();
        if (cached) return of(cached);
        throw error;
      }),
    );
  }

  clearCache(): void {
    try {
      localStorage.removeItem(this.cacheKey);
    } catch {
      // Storage can be unavailable during SSR or in privacy modes.
    }
  }

  private determineUserId(): string {
    const user = this.authService.currentUser();
    return user?.email ?? user?.uid ?? this.getOrCreateAnonymousId();
  }

  private getOrCreateAnonymousId(): string {
    const key = 'photocalia_anonymous_id';
    try {
      const existing = localStorage.getItem(key);
      if (existing) return existing;
    } catch {
      // Continue with an in-memory ID.
    }

    const id = `anon_${Date.now().toString(36)}_${this.randomPart()}`;
    try {
      localStorage.setItem(key, id);
    } catch {
      // Storage is best effort.
    }
    return id;
  }

  private randomPart(): string {
    if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
      const values = new Uint32Array(2);
      window.crypto.getRandomValues(values);
      return Array.from(values)
        .map((value) => value.toString(36))
        .join('')
        .slice(0, 13);
    }
    return Math.random().toString(36).slice(2, 15);
  }

  private async authorizationHeaders(): Promise<Record<string, string>> {
    const token = await this.auth?.currentUser?.getIdToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private normalize(raw: unknown): QuotaStatusResponse {
    const response = asRecord(raw);
    const quota = asRecord(response?.['quota']);

    if (response?.['success'] && quota) {
      const limit = numberValue(quota['limit'], response['limit']);
      const remaining = numberValue(quota['remaining'], response['remaining']);
      return {
        success: true,
        enabled: Boolean(response['enabled']),
        quota: {
          usageCount: numberValue(
            quota['usageCount'],
            quota['used'],
            quota['quotaUsed'],
            limit - remaining,
          ),
          limit,
          remaining,
          plan: planValue(quota['plan'], response['plan']),
        },
      };
    }

    if (
      ENABLE_LEGACY_QUOTA_RESPONSE_UNTIL_2026_10_01 &&
      response &&
      (typeof response['remaining'] === 'number' || typeof response['limit'] === 'number')
    ) {
      const remaining = numberValue(response['remaining'], response['quotaRemaining']);
      const limit = numberValue(response['limit'], response['quotaLimit']);
      return successQuota(
        numberValue(response['used'], limit - remaining),
        limit,
        remaining,
        planValue(response['plan']),
      );
    }

    if (
      ENABLE_LEGACY_QUOTA_RESPONSE_UNTIL_2026_10_01 &&
      response &&
      (typeof response['quotaUsed'] === 'number' || typeof response['quotaLimit'] === 'number')
    ) {
      const used = numberValue(response['quotaUsed']);
      const limit = numberValue(response['quotaLimit']);
      return successQuota(used, limit, limit - used, planValue(response['plan']));
    }

    return {
      success: false,
      enabled: false,
      quota: { usageCount: 0, limit: 0, remaining: 0, plan: 'FREE' },
    };
  }

  private saveCache(response: QuotaStatusResponse): void {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify({ ts: Date.now(), data: response }));
    } catch {
      // Storage is best effort.
    }
  }

  private loadCache(): QuotaStatusResponse | null {
    try {
      const raw = localStorage.getItem(this.cacheKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { ts?: unknown; data?: unknown };
      if (typeof parsed.ts !== 'number' || Date.now() - parsed.ts > this.cacheTtlMs) return null;
      return parsed.data as QuotaStatusResponse;
    } catch {
      return null;
    }
  }
}

function asRecord(value: unknown): UnknownRecord | null {
  return typeof value === 'object' && value !== null ? (value as UnknownRecord) : null;
}

function numberValue(...values: unknown[]): number {
  return values.find((value): value is number => typeof value === 'number') ?? 0;
}

function successQuota(
  usageCount: number,
  limit: number,
  remaining: number,
  plan: QuotaStatus['plan'],
): QuotaStatusResponse {
  return { success: true, enabled: true, quota: { usageCount, limit, remaining, plan } };
}

function planValue(...values: unknown[]): QuotaStatus['plan'] {
  const value = values.find((candidate): candidate is string => typeof candidate === 'string');
  const normalized = value?.toUpperCase();
  return normalized === 'PRO' || normalized === 'BUSINESS' || normalized === 'UNLIMITED'
    ? normalized
    : 'FREE';
}
