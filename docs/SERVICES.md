# Services Documentation

> Documentation for all services in the Photocalia calendar converter SaaS.

## Table of Contents

- [Overview](#overview)
- [Core Services](#core-services)
- [Service Guidelines](#service-guidelines)

---

## Overview

Services provide shared business logic, data management, and API integration across components. All services use Angular's dependency injection system and are provided at the root level.

### Service Architecture

```
src/app/services/
├── theme.service.ts      # Theme and appearance management
├── github.service.ts    # GitHub profile and social data
└── notion.service.ts     # Notion API integration
```

---

## Core Services

### ThemeService

**Location**: `src/app/services/theme.service.ts`

**Purpose**: Manage application theme, background, and font size settings with persistence.

#### Configuration

```typescript
interface ThemeConfig {
  THEME_MODES: string[]; // ['dark', 'white', 'glass']
  DEFAULT_THEME: string; // 'glass'
  BACKGROUND_MODES: string[]; // ['black', 'white', 'video']
  DEFAULT_BACKGROUND: string; // 'video'
  FONT_SIZES: string[]; // ['normal', 'large', 'small']
  DEFAULT_FONT_SIZE: string; // 'normal'
}
```

#### Public Methods

##### getCurrentTheme()

Returns the current theme mode.

```typescript
getCurrentTheme(): string
```

**Returns**: `'dark' | 'white' | 'glass'`

**Example**:

```typescript
const currentTheme = this.themeService.getCurrentTheme();
console.log(currentTheme); // 'glass'
```

##### cycleTheme()

Cycles to the next theme in the sequence (dark → white → glass → dark).

```typescript
cycleTheme(): string
```

**Returns**: The new theme name

**Example**:

```typescript
const newTheme = this.themeService.cycleTheme();
console.log(newTheme); // 'dark'
```

##### getCurrentBackground()

Returns the current background mode.

```typescript
getCurrentBackground(): string
```

**Returns**: `'black' | 'white' | 'video'`

##### toggleBackground()

Cycles to the next background mode.

```typescript
toggleBackground(): string
```

**Returns**: The new background mode

##### getCurrentFontSize()

Returns the current font size mode.

```typescript
getCurrentFontSize(): string
```

**Returns**: `'normal' | 'large' | 'small'`

##### cycleFontSize()

Cycles to the next font size.

```typescript
cycleFontSize(): string
```

**Returns**: The new font size mode

##### getThemeDisplayName()

Returns a user-friendly display name for a theme.

```typescript
getThemeDisplayName(theme: string): string
```

**Parameters**:

- `theme`: Theme name ('dark', 'white', 'glass')

**Returns**: Display name ('Dark Theme', 'Light Theme', 'Glass Theme')

##### getBackgroundDisplayName()

Returns a user-friendly display name for a background.

```typescript
getBackgroundDisplayName(background: string): string
```

##### getFontSizeDisplayName()

Returns a user-friendly display name for a font size.

```typescript
getFontSizeDisplayName(fontSize: string): string
```

#### Usage Example

```typescript
import { Component } from '@angular/core';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-settings',
  template: ` <button (click)="changeTheme()">Current: {{ currentTheme }}</button> `,
})
export class SettingsComponent {
  constructor(private readonly themeService: ThemeService) {}

  get currentTheme(): string {
    return this.themeService.getThemeDisplayName(this.themeService.getCurrentTheme());
  }

  changeTheme(): void {
    this.themeService.cycleTheme();
  }
}
```

#### Persistence

All theme settings are persisted to `localStorage`:

- `theme` - Current theme mode
- `background` - Current background mode
- `fontSize` - Current font size

Settings are automatically restored on page load.

---

### GithubService

**Location**: `src/app/services/github.service.ts`

**Purpose**: Fetch and manage GitHub profile data, social links, and commit activity.

#### Interfaces

```typescript
interface SocialLink {
  provider: string; // 'GitHub', 'LinkedIn', 'Twitter', etc.
  url: string; // Full URL to profile
}

interface GithubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name?: string;
  bio?: string;
  location?: string;
  public_repos: number;
  email?: string;
}

interface CommitData {
  date: number; // Unix timestamp
  value: number; // Number of commits
}
```

#### Public Methods

##### getProfile()

Fetches GitHub user profile information.

```typescript
getProfile(): Observable<GithubUser>
```

**Returns**: Observable of GitHub user data

**Caching**: Results are cached with `shareReplay(1)`

**Example**:

```typescript
this.githubService.getProfile().subscribe((user) => {
  console.log(user.name);
  console.log(user.avatar_url);
});
```

##### getSocialLinks()

Fetches social media links from API.

```typescript
getSocialLinks(): Observable<SocialLink[]>
```

**Returns**: Observable array of social links

**Caching**: Results are cached with `shareReplay(1)`

**Example**:

```typescript
this.githubService.getSocialLinks().subscribe((links) => {
  links.forEach((link) => {
    console.log(`${link.provider}: ${link.url}`);
  });
});
```

##### getCommitsV2()

Fetches GitHub commit activity data for the last year.

```typescript
getCommitsV2(): Observable<CommitData[]>
```

**Returns**: Observable array of commit data with dates and values

**Caching**: Results are cached with `shareReplay(1)`

**Example**:

```typescript
this.githubService.getCommitsV2().subscribe((commits) => {
  commits.forEach((commit) => {
    const date = new Date(commit.date);
    console.log(`${date.toDateString()}: ${commit.value} commits`);
  });
});
```

#### Configuration

The service uses `environment.apiUrl` for the base API endpoint:

```typescript
private readonly baseUrl = environment.apiUrl;
```

#### Usage Example

```typescript
import { Component, OnInit } from '@angular/core';
import { GithubService, GithubUser, SocialLink } from './services/github.service';

@Component({
  selector: 'app-profile',
  template: `
    <div class="profile">
      <img [src]="avatar" [alt]="name" />
      <h2>{{ name }}</h2>
      <p>{{ bio }}</p>

      <ul>
        @for (link of socialLinks; track link.provider) {
          <li>
            <a [href]="link.url">{{ link.provider }}</a>
          </li>
        }
      </ul>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  name = '';
  avatar = '';
  bio = '';
  socialLinks: SocialLink[] = [];

  constructor(private readonly githubService: GithubService) {}

  ngOnInit(): void {
    this.githubService.getProfile().subscribe((user) => {
      this.name = user.name || user.login;
      this.avatar = user.avatar_url;
      this.bio = user.bio || '';
    });

    this.githubService.getSocialLinks().subscribe((links) => {
      this.socialLinks = links;
    });
  }
}
```

---

### NotionService

**Location**: `src/app/services/notion.service.ts`

**Purpose**: Fetch recommended products and tools from Notion database.

#### Public Methods

##### getStuff()

Fetches recommended items categorized by type.

```typescript
getStuff(): Observable<Record<string, any[]>>
```

**Returns**: Observable of items grouped by category

**Example**:

```typescript
this.notionService.getStuff().subscribe((data) => {
  // data = {
  //   "Software": [...],
  //   "Hardware": [...],
  //   "Books": [...]
  // }

  Object.keys(data).forEach((category) => {
    console.log(`${category}:`, data[category]);
  });
});
```

#### Item Structure

Each item contains:

- `name`: Item name
- `url`: Link to product
- `description`: Short description
- `rank`: Sort order within category
- `category`: Category name

#### Usage Example

```typescript
import { Component, OnInit } from '@angular/core';
import { NotionService } from './services/notion.service';

@Component({
  selector: 'app-stuff',
  template: `
    @for (category of categories; track category) {
      <section>
        <h2>{{ category }}</h2>
        <div class="items">
          @for (item of stuffByCategory[category]; track item.name) {
            <article>
              <h3>
                <a [href]="item.url">{{ item.name }}</a>
              </h3>
              <p>{{ item.description }}</p>
            </article>
          }
        </div>
      </section>
    }
  `,
})
export class StuffComponent implements OnInit {
  stuffByCategory: Record<string, any[]> = {};

  constructor(private readonly notionService: NotionService) {}

  ngOnInit(): void {
    this.notionService.getStuff().subscribe((data) => {
      this.stuffByCategory = data;
    });
  }

  get categories(): string[] {
    return Object.keys(this.stuffByCategory);
  }
}
```

---

## Service Guidelines

### Creating New Services

#### 1. Generate Service

```bash
ng generate service services/my-service
```

#### 2. Service Structure

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MyService {
  private readonly http: HttpClient;
  private cache$?: Observable<any>;

  constructor(http: HttpClient) {
    this.http = http;
  }

  getData(): Observable<any> {
    if (!this.cache$) {
      this.cache$ = this.http.get('/api/data').pipe(shareReplay(1));
    }
    return this.cache$;
  }
}
```

### Best Practices

#### 1. Dependency Injection

Mark dependencies as `readonly`:

```typescript
constructor(
  private readonly http: HttpClient,
  private readonly myService: MyService
) {}
```

#### 2. Caching

Cache HTTP requests with `shareReplay`:

```typescript
getData(): Observable<Data> {
  if (!this.cache$) {
    this.cache$ = this.http.get<Data>('/api/data').pipe(
      shareReplay(1)
    );
  }
  return this.cache$;
}
```

#### 3. Error Handling

Handle errors gracefully:

```typescript
import { catchError, of } from 'rxjs';

getData(): Observable<Data[]> {
  return this.http.get<Data[]>('/api/data').pipe(
    catchError(error => {
      console.error('Error fetching data:', error);
      return of([]); // Return empty array as fallback
    }),
    shareReplay(1)
  );
}
```

#### 4. Type Safety

Use interfaces for data structures:

```typescript
interface UserData {
  id: number;
  name: string;
  email: string;
}

getUser(id: number): Observable<UserData> {
  return this.http.get<UserData>(`/api/users/${id}`);
}
```

#### 5. Configuration

Use environment variables for configuration:

```typescript
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  // Use baseUrl in methods
}
```

### Testing Services

#### Basic Service Test

```typescript
describe('MyService', () => {
  let service: MyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MyService],
    });

    service = TestBed.inject(MyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch data', () => {
    const mockData = [{ id: 1, name: 'Test' }];

    service.getData().subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne('/api/data');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should handle errors', () => {
    service.getData().subscribe({
      next: () => fail('Should have failed'),
      error: (error) => {
        expect(error.status).toBe(500);
      },
    });

    const req = httpMock.expectOne('/api/data');
    req.flush('Error', { status: 500, statusText: 'Server Error' });
  });
});
```

---

## Additional Resources

- [Angular Dependency Injection](https://angular.dev/guide/di)
- [RxJS Documentation](https://rxjs.dev/)
- [HttpClient Guide](https://angular.dev/guide/http)
- [Testing Services](https://angular.dev/guide/testing/services)
