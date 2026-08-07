import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocalizeRoutePipe } from '../../shared/pipes/localize-route.pipe';
import { PlanService } from '../../services/plan.service';

@Component({
  selector: 'app-terms',
  imports: [RouterLink, LocalizeRoutePipe],
  templateUrl: './terms.html',
  styleUrl: './terms.scss',
})
export class Terms {
  protected readonly freePlanLimit = inject(PlanService).freePlanLimit;
}
