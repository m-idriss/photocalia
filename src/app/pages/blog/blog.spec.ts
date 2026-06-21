import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { Blog } from './blog';

describe('Blog', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Blog],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Blog);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should sort articles from newest to oldest', () => {
    const fixture = TestBed.createComponent(Blog);
    const articles = fixture.componentInstance.articles;
    const dates = articles.map((article) => article.datePublished);

    expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)));
  });

  it('should include generated Markdown metadata and localized content', () => {
    const fixture = TestBed.createComponent(Blog);
    const examArticle = fixture.componentInstance.articles.find(
      (item) => item.slug === 'summer-exam-scheduling',
    );
    const familyArticle = fixture.componentInstance.articles.find(
      (item) => item.slug === 'family-reunion-planning',
    );
    const festivalArticle = fixture.componentInstance.articles.find(
      (item) => item.slug === 'music-festival-lineup',
    );

    expect(examArticle).toEqual(
      jasmine.objectContaining({
        datePublished: '2026-06-12',
        readingTime: '6 min',
      }),
    );
    expect(examArticle?.locales.en.title).toContain('Summer Exam Scheduling');
    expect(examArticle?.locales.fr.title).toContain("examens d'été");

    expect(familyArticle).toEqual(
      jasmine.objectContaining({
        datePublished: '2026-06-14',
        image: '/assets/images/blog/family-reunion-planning.jpg',
      }),
    );
    expect(familyArticle?.locales.fr.title).toContain('Réunion de famille');

    expect(festivalArticle).toEqual(
      jasmine.objectContaining({
        datePublished: '2026-06-14',
        image: '/assets/images/blog/music-festival-lineup.jpg',
      }),
    );
    expect(festivalArticle?.locales.fr.title).toContain('Festival');
  });

  it('should filter articles by localized title without accents', () => {
    const fixture = TestBed.createComponent(Blog);
    const component = fixture.componentInstance as unknown as {
      searchQuery: { set: (value: string) => void };
      filteredArticles: () => { slug: string }[];
    };

    component.searchQuery.set('reunion');

    expect(component.filteredArticles().map((article) => article.slug)).toContain(
      'family-reunion-planning',
    );
  });

  it('should filter articles by tags and keywords', () => {
    const fixture = TestBed.createComponent(Blog);
    const component = fixture.componentInstance as unknown as {
      searchQuery: { set: (value: string) => void };
      filteredArticles: () => { slug: string }[];
    };

    component.searchQuery.set('google-calendar');

    expect(component.filteredArticles().map((article) => article.slug)).toContain(
      'photo-to-google-calendar',
    );
  });

  it('should render the empty search state', () => {
    const fixture = TestBed.createComponent(Blog);
    const component = fixture.componentInstance as unknown as {
      searchQuery: { set: (value: string) => void };
    };

    component.searchQuery.set('no matching guide');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.empty-state')).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('.article-card').length).toBe(0);
  });

  it('should navigate to global search when a tag chip is clicked', () => {
    const fixture = TestBed.createComponent(Blog);
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();

    const tagButton = fixture.nativeElement.querySelector('.tag') as HTMLButtonElement;
    const tag = tagButton.textContent?.trim();
    tagButton.click();
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/search'], {
      queryParams: { q: tag },
    });
  });
});
