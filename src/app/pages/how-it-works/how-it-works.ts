import { Component, inject, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { LocalizeRoutePipe } from '../../shared/pipes/localize-route.pipe';
import { ScrollRevealDirective } from '../../shared/directives';
import { PlanService } from '../../services/plan.service';
import { RecommendedGuides } from '../../components/recommended-guides/recommended-guides';

@Component({
  selector: 'app-how-it-works',
  imports: [
    TranslatePipe,
    RouterModule,
    LocalizeRoutePipe,
    ScrollRevealDirective,
    RecommendedGuides,
  ],
  templateUrl: './how-it-works.html',
  styleUrl: './how-it-works.scss',
})
export class HowItWorks {
  protected readonly planService = inject(PlanService);
  protected readonly planParams = computed(() => ({ freeLimit: this.planService.freePlanLimit() }));
}
