import { Injectable, inject, signal } from '@angular/core';
import { ConverterService, PlanInfo } from './converter';

@Injectable({
  providedIn: 'root',
})
export class PlanService {
  private readonly converterService = inject(ConverterService);

  readonly plans = signal<PlanInfo[]>([]);
  readonly freePlanLimit = signal<number>(10);

  constructor() {
    this.converterService.fetchPlans().subscribe((plans) => {
      if (plans.length > 0) {
        this.plans.set(plans);
        const free = plans.find((p) => p.plan === 'FREE');
        if (free) {
          this.freePlanLimit.set(free.limit);
        }
      }
    });
  }
}
