# Component Documentation

> Comprehensive documentation for all components in the Photocalia calendar converter SaaS.

## Table of Contents

- [Overview](#overview)
- [Component Architecture](#component-architecture)
- [Core Components](#core-components)
- [Component Guidelines](#component-guidelines)

---

## Overview

This application uses Angular 20+ standalone components with a modular architecture. Each component is self-contained with its own TypeScript logic, HTML template, and SCSS styles.

### Key Principles

- **Standalone Components**: All components use the standalone API (no NgModules)
- **Reactive Programming**: RxJS observables for data management
- **Type Safety**: Full TypeScript strict mode compliance
- **Accessibility**: WCAG 2.1 AA compliance goals
- **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox

---

## Component Architecture

### Directory Structure

```
src/app/components/
├── profile-card/       # Profile photo, name, and social links
├── about/              # About me section
├── tech-stack/         # Technologies and skills
├── github-activity/    # GitHub contribution heatmap
├── experience/         # Work experience and projects
├── education/          # Education and training
├── stuff/              # Recommended products and tools
├── hobbies/            # Personal interests
└── contact/            # Contact information
```

### Component Template

Each component follows this structure:

```
component-name/
├── component-name.ts       # Component logic
├── component-name.html     # Template
├── component-name.scss     # Styles
└── component-name.spec.ts  # Unit tests
```

---

## Core Components

### ProfileCard

**Location**: `src/app/components/profile-card/`

**Purpose**: Displays user profile information, social links, and theme controls.

**Features**:

- GitHub profile integration via `GithubService`
- Social media links fetched from API
- Theme switching controls (dark/light/glass)
- Background toggle (black/white/video)
- Font size adjustment
- Responsive burger menu for mobile
- Keyboard navigation support (Escape to close menu)

**Key Properties**:

```typescript
menuOpen: boolean              // Menu state
socialLinks: SocialLink[]      // Social media links
profileData: GithubUser | null // User profile data
```

**Key Methods**:

```typescript
toggleMenu(); // Toggle mobile menu
cycleTheme(); // Switch between themes
toggleVideoBg(); // Toggle background modes
changeFontSize(); // Cycle through font sizes
```

**Dependencies**:

- `ThemeService` - Theme management
- `GithubService` - Profile and social data

**Usage**:

```html
<app-profile-card></app-profile-card>
```

---

### About

**Location**: `src/app/components/about/`

**Purpose**: Display personal introduction and professional summary.

**Features**:

- Rich text content area
- Glassmorphism card styling
- Responsive typography
- Accessible semantic HTML

**Usage**:

```html
<app-about></app-about>
```

---

### TechStack

**Location**: `src/app/components/tech-stack/`

**Purpose**: Showcase technical skills and technologies.

**Features**:

- Categorized technology display
- Icon integration for visual appeal
- Skill grouping by category
- Hover effects for interactivity

**Usage**:

```html
<app-tech-stack></app-tech-stack>
```

---

### GithubActivity

**Location**: `src/app/components/github-activity/`

**Purpose**: Display GitHub contribution activity using a calendar heatmap.

**Features**:

- Integration with GitHub API via `GithubService`
- Cal-heatmap visualization library
- Interactive contribution calendar
- Last 365 days of activity
- Responsive design

**Key Properties**:

```typescript
commits: CommitData[]  // Contribution data
```

**Key Methods**:

```typescript
ngOnInit(); // Initialize and fetch commit data
```

**Dependencies**:

- `GithubService` - GitHub commit data
- `cal-heatmap` - Heatmap visualization

**Usage**:

```html
<app-github-activity></app-github-activity>
```

---

### Experience

**Location**: `src/app/components/experience/`

**Purpose**: Display professional work experience and projects.

**Features**:

- Timeline layout
- Project descriptions
- Technology tags
- Expandable details
- Responsive grid layout

**Usage**:

```html
<app-experience></app-experience>
```

---

### Education

**Location**: `src/app/components/education/`

**Purpose**: Show academic background and training.

**Features**:

- Educational institution details
- Degree/certification information
- Timeline presentation
- Responsive cards

**Usage**:

```html
<app-education></app-education>
```

---

### Stuff

**Location**: `src/app/components/stuff/`

**Purpose**: Display recommended products, tools, and resources.

**Features**:

- Notion API integration via `NotionService`
- Categorized recommendations
- Product cards with descriptions
- External links to products
- Ranking/sorting capability

**Key Properties**:

```typescript
stuffByCategory: Record<string, any[]>; // Categorized items
```

**Dependencies**:

- `NotionService` - Fetch recommendations from Notion database

**Usage**:

```html
<app-stuff></app-stuff>
```

---

### Hobbies

**Location**: `src/app/components/hobbies/`

**Purpose**: Showcase personal interests and hobbies.

**Features**:

- Visual hobby cards
- Icon/image support
- Descriptive content
- Responsive grid layout

**Usage**:

```html
<app-hobbies></app-hobbies>
```

---

### Contact

**Location**: `src/app/components/contact/`

**Purpose**: Display contact information and social links.

**Features**:

- Email display
- Social media links
- Call-to-action buttons
- Accessible links

**Usage**:

```html
<app-contact></app-contact>
```

---

## Component Guidelines

### Creating New Components

1. **Generate component using Angular CLI**:

   ```bash
   ng generate component components/my-component --style=scss
   ```

2. **Convert to standalone** (if not using `--standalone` flag):

   ```typescript
   @Component({
     selector: 'app-my-component',
     standalone: true,
     imports: [/* other imports as needed */],
     templateUrl: './my-component.html',
     styleUrl: './my-component.scss'
   })
   ```

   > **Note**: Use `styleUrl` (singular) for single stylesheets in Angular 20+.
   > Only import modules you actually use. Control flow (`@if`, `@for`) and property binding don't require `CommonModule`.

3. **Follow naming conventions**:
   - Component class: PascalCase (e.g., `MyComponent`)
   - Selector: kebab-case with `app-` prefix (e.g., `app-my-component`)
   - Files: kebab-case (e.g., `my-component.ts`)

4. **Add to main app**:

   ```typescript
   // In src/app/app.ts
   import { MyComponent } from './components/my-component/my-component';

   @Component({
     imports: [/* ... */, MyComponent]
   })
   ```

### Component Best Practices

#### TypeScript

- **Use strict typing**: Enable TypeScript strict mode
- **Readonly properties**: Mark service dependencies as `readonly`
- **Type interfaces**: Define interfaces for data structures
- **Signals**: Consider using Angular signals for reactive state

Example:

```typescript
export class MyComponent implements OnInit {
  private readonly myService: MyService;

  items: Item[] = [];

  constructor(myService: MyService) {
    this.myService = myService;
  }
}
```

#### Templates

- **Semantic HTML**: Use proper HTML5 elements
- **Accessibility**: Add ARIA labels and roles
- **Conditional rendering**: Use `@if` and `@for` (Angular 20+)
- **Safe navigation**: Use optional chaining for nullable properties

Example:

```html
<section aria-labelledby="section-title">
  <h2 id="section-title">My Section</h2>
  @for (item of items; track item.id) {
  <div>{{ item.name }}</div>
  }
</section>
```

#### Styling

- **SCSS modules**: Use component-scoped styles
- **CSS custom properties**: Leverage global theme variables
- **BEM-like naming**: Use consistent class naming
- **Responsive design**: Mobile-first with media queries

Example:

```scss
.component {
  padding: var(--space-md);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);

  &__title {
    color: var(--text-primary);
    font-size: var(--font-size-xl);
  }

  @media (max-width: 768px) {
    padding: var(--space-sm);
  }
}
```

#### Testing

- **Unit tests**: Test component logic and methods
- **Component tests**: Test DOM rendering and user interactions
- **Mock services**: Use TestBed to provide mock dependencies
- **Accessibility tests**: Verify ARIA attributes and semantic HTML

Example:

```typescript
describe('MyComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent],
      providers: [{ provide: MyService, useValue: mockService }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MyComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
```

### Performance Optimization

1. **OnPush Change Detection**: Consider using `ChangeDetectionStrategy.OnPush`
2. **trackBy Functions**: Use trackBy for `@for` loops with large lists
3. **Lazy Loading**: Load components only when needed
4. **Pure Pipes**: Use pure pipes for transformations
5. **Memoization**: Cache expensive computations

### Accessibility Checklist

- [ ] Semantic HTML elements used
- [ ] ARIA labels added where needed
- [ ] Keyboard navigation supported
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader tested
- [ ] Alt text for images
- [ ] Form labels associated with inputs

---

## Additional Resources

- [Angular Component Documentation](https://angular.dev/guide/components)
- [Angular Style Guide](https://angular.dev/style-guide)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/?versions=2.1)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
