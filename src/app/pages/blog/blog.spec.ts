import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

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
});
