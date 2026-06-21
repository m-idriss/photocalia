import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocalizeRoutePipe } from '../../shared/pipes/localize-route.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

type GuideVariant = 'home' | 'how-it-works' | 'pricing' | 'about';

interface RecommendedGuide {
  titleKey: string;
  descriptionKey: string;
  url: string;
}

interface RecommendedGuideSet {
  titleKey: string;
  descriptionKey: string;
  guides: RecommendedGuide[];
}

const GUIDE_SETS: Record<GuideVariant, RecommendedGuideSet> = {
  home: {
    titleKey: 'recommendedGuides.home.title',
    descriptionKey: 'recommendedGuides.home.description',
    guides: [
      {
        titleKey: 'recommendedGuides.photoToCalendar.title',
        descriptionKey: 'recommendedGuides.photoToCalendar.description',
        url: '/photo-to-calendar',
      },
      {
        titleKey: 'recommendedGuides.paperSchedules.title',
        descriptionKey: 'recommendedGuides.paperSchedules.description',
        url: '/blog/digitize-paper-schedules',
      },
      {
        titleKey: 'recommendedGuides.aiOcr.title',
        descriptionKey: 'recommendedGuides.aiOcr.description',
        url: '/ocr-calendar-extraction',
      },
    ],
  },
  'how-it-works': {
    titleKey: 'recommendedGuides.howItWorksPage.title',
    descriptionKey: 'recommendedGuides.howItWorksPage.description',
    guides: [
      {
        titleKey: 'recommendedGuides.aiOcr.title',
        descriptionKey: 'recommendedGuides.aiOcr.description',
        url: '/ocr-calendar-extraction',
      },
      {
        titleKey: 'recommendedGuides.healthcare.title',
        descriptionKey: 'recommendedGuides.healthcare.description',
        url: '/blog/healthcare-appointments',
      },
      {
        titleKey: 'recommendedGuides.examSchedules.title',
        descriptionKey: 'recommendedGuides.examSchedules.description',
        url: '/blog/summer-exam-scheduling',
      },
    ],
  },
  pricing: {
    titleKey: 'recommendedGuides.pricing.title',
    descriptionKey: 'recommendedGuides.pricing.description',
    guides: [
      {
        titleKey: 'recommendedGuides.batchPlanning.title',
        descriptionKey: 'recommendedGuides.batchPlanning.description',
        url: '/blog/family-reunion-planning',
      },
      {
        titleKey: 'recommendedGuides.sportsSchedules.title',
        descriptionKey: 'recommendedGuides.sportsSchedules.description',
        url: '/blog/sports-league-training',
      },
      {
        titleKey: 'recommendedGuides.howItWorks.title',
        descriptionKey: 'recommendedGuides.howItWorks.description',
        url: '/how-it-works',
      },
    ],
  },
  about: {
    titleKey: 'recommendedGuides.about.title',
    descriptionKey: 'recommendedGuides.about.description',
    guides: [
      {
        titleKey: 'recommendedGuides.aiOcr.title',
        descriptionKey: 'recommendedGuides.aiOcr.description',
        url: '/ocr-calendar-extraction',
      },
      {
        titleKey: 'recommendedGuides.privacy.title',
        descriptionKey: 'recommendedGuides.privacy.description',
        url: '/privacy',
      },
      {
        titleKey: 'recommendedGuides.allGuides.title',
        descriptionKey: 'recommendedGuides.allGuides.description',
        url: '/blog',
      },
    ],
  },
};

@Component({
  selector: 'app-recommended-guides',
  standalone: true,
  imports: [RouterLink, LocalizeRoutePipe, TranslatePipe],
  templateUrl: './recommended-guides.html',
  styleUrl: './recommended-guides.scss',
})
export class RecommendedGuides {
  @Input({ required: true }) variant!: GuideVariant;

  protected get guideSet(): RecommendedGuideSet {
    return GUIDE_SETS[this.variant];
  }

  protected get guides(): RecommendedGuide[] {
    return this.guideSet.guides;
  }
}
