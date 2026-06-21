import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Search, normalizeSearchTerm } from './search';

describe('Search', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Search],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Search);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should normalize case and accents', () => {
    expect(normalizeSearchTerm('Réunion de Famille')).toBe('reunion de famille');
  });

  it('should find static pages', () => {
    const fixture = TestBed.createComponent(Search);
    const component = fixture.componentInstance as unknown as {
      searchQuery: { set: (value: string) => void };
      results: () => { id: string }[];
    };

    component.searchQuery.set('pricing');

    expect(component.results().map((result) => result.id)).toContain('pricing');
  });

  it('should show every indexed entry when search is empty', () => {
    const fixture = TestBed.createComponent(Search);
    const component = fixture.componentInstance as unknown as {
      results: () => { id: string }[];
    };

    expect(component.results().length).toBeGreaterThan(10);
    expect(component.results().map((result) => result.id)).toContain('home');
    expect(component.results().map((result) => result.id)).toContain('blog-music-festival-lineup');
  });

  it('should find blog guides by tag', () => {
    const fixture = TestBed.createComponent(Search);
    const component = fixture.componentInstance as unknown as {
      searchQuery: { set: (value: string) => void };
      results: () => { id: string }[];
    };

    component.searchQuery.set('festival');

    expect(component.results().map((result) => result.id)).toContain('blog-music-festival-lineup');
  });

  it('should include images for page and blog results', () => {
    const fixture = TestBed.createComponent(Search);
    const component = fixture.componentInstance as unknown as {
      searchQuery: { set: (value: string) => void };
      results: () => { id: string; image: string }[];
    };

    component.searchQuery.set('festival');

    expect(component.results().every((result) => result.image)).toBeTrue();
    expect(
      component.results().find((result) => result.id === 'blog-music-festival-lineup')?.image,
    ).toBe('/assets/images/blog/music-festival-lineup.jpg');
  });

  it('should render an empty state for unmatched queries', () => {
    const fixture = TestBed.createComponent(Search);
    const component = fixture.componentInstance as unknown as {
      searchQuery: { set: (value: string) => void };
    };

    component.searchQuery.set('unmatched search query');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.empty-state')).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('.article-card').length).toBe(0);
  });
});
