import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ConversionRequest, ConversionResponse, PlanInfo } from '../models/converter-api.model';
import { InstallationIdentityService } from './installation-identity.service';

@Injectable({ providedIn: 'root' })
export class ConverterApiClient {
  private readonly http = inject(HttpClient);
  private readonly installationIdentity = inject(InstallationIdentityService);
  private readonly baseUrl = `${environment.apiUrl}/converter`;

  convert(request: ConversionRequest, idempotencyKey: string): Observable<ConversionResponse> {
    return this.http.post<ConversionResponse>(this.baseUrl, request, {
      headers: {
        'Idempotency-Key': idempotencyKey,
        'X-Installation-ID': this.installationIdentity.getId(),
      },
    });
  }

  getQuotaStatus(userId: string, headers: Record<string, string>): Observable<unknown> {
    return this.http.get<unknown>(
      `${this.baseUrl}/quota-status?userId=${encodeURIComponent(userId)}`,
      {
        headers: {
          ...headers,
          'X-Installation-ID': this.installationIdentity.getId(),
        },
      },
    );
  }

  getPlans(): Observable<PlanInfo[]> {
    return this.http.get<PlanInfo[]>(`${this.baseUrl}/plans`);
  }
}
