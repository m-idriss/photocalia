# Development Guidelines

> Best practices and guidelines for developing the Photocalia calendar converter SaaS.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Guidelines](#testing-guidelines)
- [Git Workflow](#git-workflow)
- [Performance Guidelines](#performance-guidelines)

---

## Getting Started

### Prerequisites

- **Node.js**: 22.22.3 (see `.node-version`)
- **npm**: 10+
- **Chrome/Chromium**: For testing
- **Git**: For version control

### Initial Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/m-idriss/Photocalia.git
   cd Photocalia
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

   _Note: Takes ~30 seconds, never cancel the installation_

3. **Install Firebase Functions dependencies** (if using Firebase features):

   ```bash
   cd functions
   npm install
   cd ..
   ```

4. **Verify installation**:

   ```bash
   npm run build
   ```

   _Note: Takes ~14 seconds, never cancel builds_

### Development Server

Start the development server:

```bash
npm start
# OR
ng serve
```

The application runs at `http://localhost:4200/` with hot reload enabled.

---

## Development Workflow

### Daily Development

1. **Pull latest changes**:

   ```bash
   git pull origin main
   ```

2. **Create feature branch**:

   ```bash
   git checkout -b feature/my-feature
   ```

3. **Start development server**:

   ```bash
   npm start
   ```

4. **Make changes and test frequently**:

   ```bash
   npm run build        # Validate build (~14 seconds)
   npm test             # Run tests (< 1 second in headless mode)
   ```

5. **Commit changes**:

   ```bash
   git add .
   git commit -m "feat: add my feature"
   ```

6. **Push and create PR**:
   ```bash
   git push origin feature/my-feature
   ```

### Build Process

#### Development Build

```bash
npm run build
```

- Takes ~14 seconds, set timeout to 30+ seconds
- Outputs to `dist/Photocalia/`
- Includes source maps for debugging

#### Production Build

```bash
npm run build -- --configuration=production
```

- Takes ~14 seconds, set timeout to 30+ seconds
- Optimized bundles with minification
- Tree-shaking and dead code elimination

#### Expected Build Warnings (NORMAL)

- Bundle size warnings may appear (2.04 MB raw exceeds 1.80 MB budget by 239.71 kB)
- Converter styles may slightly exceed budget (13.38 kB vs 13.00 kB budget)
- These warnings are tracked and acceptable for the current feature set

### Testing

#### Frontend CI Baseline

Pull requests targeting `main` run the frontend checks sequentially to avoid concurrent esbuild
processes sharing the same workspace. Run the same verification locally from a clean checkout:

```bash
npm ci
npm run blog:check
npm run lint
npm run test:ci
npm run build:ci
npm run verify:clean
```

The shorthand below runs the checks after dependencies are installed:

```bash
npm run verify:frontend
```

`blog:check` validates generated blog data, prerender routes, and the sitemap without modifying
them. If it fails, run `npm run blog:generate` and commit the resulting generated files.

#### Unit Tests

```bash
# Run all tests once (headless)
CHROME_BIN=/usr/bin/google-chrome-stable npx ng test --browsers=ChromeHeadless --watch=false
```

- Takes < 1 second to execute tests, set timeout to 30+ seconds for build
- All tests pass successfully

#### Watch Mode (Interactive)

```bash
npm test
```

- Watches for file changes
- Re-runs affected tests automatically

#### Expected Test Behavior

- **61 total tests** - all passing ✅
- Tests build and execute in headless Chrome
- Test execution is very fast (< 1 second)

### Code Formatting

Format code using Prettier:

```bash
npx prettier --write src/
```

Configuration is in `package.json`:

```json
{
  "prettier": {
    "printWidth": 100,
    "singleQuote": true
  }
}
```

---

## Code Standards

### TypeScript

#### General Rules

- **Enable strict mode**: Always use TypeScript strict mode
- **Explicit types**: Prefer explicit types over `any`
- **Readonly**: Mark service dependencies as `readonly`
- **Interfaces**: Define interfaces for data structures
- **Enums**: Use enums for fixed sets of values

#### Example

```typescript
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export class MyComponent implements OnInit {
  private readonly userService: UserService;

  users: UserProfile[] = [];
  selectedUser: UserProfile | null = null;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.userService.getUsers().subscribe((users) => {
      this.users = users;
    });
  }
}
```

### Angular Components

#### Standalone Components

All components must be standalone (no NgModules):

```typescript
@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [
    /* only import what you actually use */
  ],
  templateUrl: './my-component.html',
  styleUrl: './my-component.scss',
})
export class MyComponent {}
```

> **Note**: In Angular 20+, use `styleUrl` (singular) for single stylesheets.
> Only import `CommonModule` if you need legacy directives like `*ngIf` or `*ngFor` (prefer `@if` and `@for` instead).

#### Naming Conventions

- **Components**: PascalCase class names (e.g., `ProfileCard`, `TechStack`)
- **Selectors**: kebab-case with `app-` prefix (e.g., `app-profile-card`)
- **Files**: kebab-case (e.g., `profile-card.ts`, `tech-stack.html`)
- **Services**: PascalCase with `Service` suffix (e.g., `ThemeService`)

#### Component Structure

```typescript
@Component({
  // Component decorator
})
export class MyComponent implements OnInit, OnDestroy {
  // 1. Public properties
  items: Item[] = [];

  // 2. Private properties
  private subscription?: Subscription;

  // 3. Constructor
  constructor(private readonly myService: MyService) {}

  // 4. Lifecycle hooks
  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  // 5. Public methods
  handleClick(): void {
    // Implementation
  }

  // 6. Private methods
  private loadData(): void {
    // Implementation
  }
}
```

### HTML Templates

#### Semantic HTML

Use proper HTML5 semantic elements:

```html
<article>
  <header>
    <h2 id="section-title">Title</h2>
  </header>

  <section aria-labelledby="section-title">
    <!-- Content -->
  </section>

  <footer>
    <!-- Footer content -->
  </footer>
</article>
```

#### Control Flow (Angular 20+)

Use new control flow syntax:

```html
<!-- Conditionals -->
@if (user) {
<p>Welcome, {{ user.name }}!</p>
} @else {
<p>Please log in</p>
}

<!-- Loops -->
@for (item of items; track item.id) {
<div>{{ item.name }}</div>
} @empty {
<p>No items found</p>
}

<!-- Switch -->
@switch (status) { @case ('loading') {
<p>Loading...</p>
} @case ('success') {
<p>Success!</p>
} @default {
<p>Unknown status</p>
} }
```

### SCSS Styles

#### File Organization

```scss
// 1. Imports
@import 'variables';

// 2. Component root
.component {
  padding: var(--space-md);

  // 3. Element modifiers
  &--variant {
    background: var(--accent-color);
  }

  // 4. Child elements
  &__header {
    font-size: var(--font-size-lg);
  }

  // 5. States
  &:hover {
    transform: translateY(-2px);
  }

  // 6. Media queries
  @media (max-width: 768px) {
    padding: var(--space-sm);
  }
}
```

#### CSS Custom Properties

Use theme variables from `src/styles.scss`:

```scss
.card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  padding: var(--space-md);
}
```

#### Available Theme Variables

```scss
// Colors
--text-primary
--text-secondary
--accent-color
--body-bg

// Glassmorphism
--glass-bg
--glass-blur
--glass-border

// Spacing
--space-xs
--space-sm
--space-md
--space-lg
--space-xl

// Typography
--font-family
--font-size-base
--font-size-lg
--font-size-xl

// Border & Border Radius
--border-radius
--border-radius-sm
--border-radius-lg

// Transitions
--t-fast
--t-medium
--t-slow
--ease
```

### Services

#### Injectable Services

```typescript
@Injectable({
  providedIn: 'root',
})
export class MyService {
  private readonly http: HttpClient;
  private cache$ = new Map<string, Observable<any>>();

  constructor(http: HttpClient) {
    this.http = http;
  }

  getData(id: string): Observable<Data> {
    if (!this.cache$.has(id)) {
      this.cache$.set(id, this.http.get<Data>(`/api/data/${id}`).pipe(shareReplay(1)));
    }
    return this.cache$.get(id)!;
  }
}
```

---

## Testing Guidelines

### Unit Testing

#### Component Tests

```typescript
describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent],
      providers: [{ provide: MyService, useValue: mockService }],
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Expected Title');
  });

  it('should handle user interaction', () => {
    spyOn(component, 'handleClick');
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.handleClick).toHaveBeenCalled();
  });
});
```

#### Service Tests

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

  it('should fetch data', () => {
    const mockData = { id: 1, name: 'Test' };

    service.getData('1').subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne('/api/data/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });
});
```

### Test Coverage Goals

- **Overall**: >80% coverage
- **Critical paths**: 100% coverage
- **Services**: 90%+ coverage
- **Components**: 80%+ coverage

---

## Git Workflow

### Branch Naming

- **Features**: `feature/short-description`
- **Fixes**: `fix/short-description`
- **Docs**: `docs/short-description`
- **Refactor**: `refactor/short-description`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```
type(scope): subject

body (optional)

footer (optional)
```

#### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

#### Examples

```bash
feat(profile): add social media links
fix(theme): resolve dark mode contrast issue
docs(readme): update installation instructions
refactor(services): simplify API calls
test(components): add unit tests for ProfileCard
```

### Pull Request Process

1. **Create descriptive PR title**:
   - Follow commit message conventions
   - Be clear and concise

2. **Fill PR template**:
   - Describe changes
   - Link related issues
   - List testing steps

3. **Ensure CI passes**:
   - Build successful
   - Tests passing
   - No linting errors

4. **Request review**:
   - Wait for approval
   - Address feedback
   - Update as needed

---

## Performance Guidelines

### Bundle Size

- **Raw Size**: 2.04 MB (optimized and minified)
- **Transferred**: 475.15 KB (gzipped over network)
- **Status**: Slightly exceeds budget (tracked for optimization)

### Optimization Techniques

1. **Lazy Loading**:

   ```typescript
   const routes = [
     {
       path: 'admin',
       loadComponent: () => import('./admin/admin').then((m) => m.AdminComponent),
     },
   ];
   ```

2. **OnPush Change Detection**:

   ```typescript
   @Component({
     changeDetection: ChangeDetectionStrategy.OnPush
   })
   ```

3. **trackBy Functions**:

   ```html
   @for (item of items; track trackById(item)) {
   <div>{{ item.name }}</div>
   }
   ```

   ```typescript
   trackById(item: Item): number {
     return item.id;
   }
   ```

4. **Image Optimization**:
   - Use WebP format
   - Implement lazy loading
   - Compress images

5. **Code Splitting**:
   - Split large components
   - Use dynamic imports
   - Lazy load routes

### Performance Metrics

Monitor with Lighthouse:

- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Time to Interactive**: <3.5s
- **Cumulative Layout Shift**: <0.1

---

## Additional Resources

- [Angular Documentation](https://angular.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [RxJS Documentation](https://rxjs.dev/)
- [SCSS Documentation](https://sass-lang.com/documentation/)
- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- [Lighthouse Performance](https://developer.chrome.com/docs/lighthouse/overview/)
