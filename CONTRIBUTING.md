# Contributing Guidelines

> Thank you for your interest in contributing to the Photocalia project!

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Style Guides](#style-guides)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone. We expect all contributors to:

- Be respectful and professional
- Accept constructive criticism gracefully
- Focus on what is best for the project
- Show empathy towards other contributors

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

---

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**When submitting a bug report, include:**

- **Clear title**: Descriptive and specific
- **Description**: Detailed explanation of the issue
- **Steps to reproduce**: Clear, numbered steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable
- **Environment**: Browser, OS, Node version
- **Additional context**: Any other relevant information

**Example:**

```markdown
### Bug: Theme toggle not working on mobile

**Description:**
The theme toggle button in the burger menu doesn't switch themes on mobile devices.

**Steps to Reproduce:**
1. Open the site on mobile (or mobile viewport)
2. Click the burger menu icon
3. Click the theme toggle button
4. Observe that theme doesn't change

**Expected Behavior:**
Theme should switch between dark/light/glass modes

**Actual Behavior:**
Button clicks but theme remains unchanged

**Environment:**
- Browser: Chrome Mobile 120
- Device: iPhone 13 Pro
- iOS: 17.2

**Screenshots:**
[Attach screenshots]
```

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- **Clear title**: Descriptive feature name
- **Motivation**: Why this enhancement is needed
- **Use case**: How it will be used
- **Proposed solution**: Your idea for implementation
- **Alternatives**: Other approaches considered
- **Additional context**: Mockups, examples, references

**Example:**

```markdown
### Enhancement: Add dark mode toggle animation

**Motivation:**
Enhance user experience with a smooth transition when switching themes

**Use Case:**
Users switching between themes should see a pleasant animation

**Proposed Solution:**
Add a fade transition and color interpolation when themes change

**Alternatives:**
- Instant theme change (current behavior)
- Slide transition

**Additional Context:**
See [Material Design theme transitions](https://material.io)
```

### Contributing Code

1. **Check existing issues**: See if someone is already working on it
2. **Create an issue**: Discuss your idea before implementing
3. **Fork the repository**: Make changes in your fork
4. **Create a branch**: Use descriptive branch names
5. **Make changes**: Follow code style and guidelines
6. **Test thoroughly**: Ensure nothing breaks
7. **Submit a pull request**: Reference related issues

---

## Development Setup

### Prerequisites

Ensure you have:
- **Node.js**: 20+ (Functions require Node 22 but work with 20)
- **npm**: 10+
- **Git**: Latest version
- **Chrome/Chromium**: For testing

### Initial Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/photocalia.git
   cd photocalia
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/m-idriss/photocalia.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```
   *Note: Takes ~30 seconds, do not cancel*

5. **Verify setup**:
   ```bash
   npm run build
   npm start
   ```

---

## Making Changes

### Branch Strategy

Create a branch for your changes:

```bash
git checkout -b feature/my-feature
```

**Branch naming conventions:**
- `feature/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `docs/doc-name` - Documentation updates
- `refactor/refactor-name` - Code refactoring
- `test/test-name` - Test additions/updates

### Development Workflow

1. **Keep your fork updated**:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create your branch**:
   ```bash
   git checkout -b feature/my-feature
   ```

3. **Make changes**:
   - Edit files as needed
   - Follow style guides
   - Add tests for new code
   - Update documentation

4. **Test your changes**:
   ```bash
   # Build
   npm run build
   
   # Run tests
   npm test
   
   # Test manually
   npm start
   ```

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add my feature"
   ```

6. **Push to your fork**:
   ```bash
   git push origin feature/my-feature
   ```

### Running Tests

#### Unit Tests
```bash
# Run all tests (headless)
CHROME_BIN=/usr/bin/google-chrome-stable npx ng test --browsers=ChromeHeadless --watch=false

# Run tests in watch mode
npm test
```

#### Manual Testing
```bash
# Start development server
npm start

# Open http://localhost:4200/
# Test your changes manually
```

### Code Formatting

Format your code before committing:

```bash
npx prettier --write src/
```

---

## Submitting Changes

### Creating a Pull Request

1. **Push your branch** to your fork
2. **Open a pull request** on GitHub
3. **Fill out the PR template** completely
4. **Link related issues** using `Fixes #123` or `Closes #123`

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] No console errors
- [ ] Responsive design verified

## Screenshots (if applicable)
[Add screenshots here]

## Related Issues
Fixes #123
```

### PR Requirements

Before submitting, ensure:

- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] No merge conflicts
- [ ] PR description is complete

### Review Process

1. **Automated checks**: CI/CD must pass
2. **Code review**: Maintainer reviews code
3. **Feedback**: Address any requested changes
4. **Approval**: PR is approved
5. **Merge**: Changes are merged to main

---

## Style Guides

### TypeScript Style Guide

#### General

- Use TypeScript strict mode
- Prefer `const` over `let`, avoid `var`
- Use explicit types, avoid `any`
- Mark service dependencies as `readonly`

#### Naming Conventions

```typescript
// Classes: PascalCase
class ProfileCard {}

// Interfaces: PascalCase
interface UserProfile {}

// Variables: camelCase
const userName = 'John';

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';

// Functions: camelCase
function getUserProfile() {}

// Private properties: prefix with _
private _internalState: string;
```

#### Example

```typescript
export interface UserProfile {
  id: number;
  name: string;
  email: string;
}

export class GithubService {
  private readonly http: HttpClient;
  
  constructor(http: HttpClient) {
    this.http = http;
  }
  
  getProfile(id: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`/api/users/${id}`);
  }
}
```

### Angular Style Guide

Follow the [Official Angular Style Guide](https://angular.dev/style-guide).

**Key points:**

- Use standalone components
- One component per file
- Component selector: `app-` prefix
- Small, focused components
- Services for shared logic

### HTML/Template Style Guide

```html
<!-- Use semantic HTML -->
<article>
  <header>
    <h2>Title</h2>
  </header>
  
  <section>
    <!-- Content -->
  </section>
</article>

<!-- Use new control flow syntax -->
@if (condition) {
  <p>Content</p>
}

@for (item of items; track item.id) {
  <div>{{ item.name }}</div>
}

<!-- Add accessibility attributes -->
<button aria-label="Close menu">
  <i class="fa fa-times"></i>
</button>
```

### SCSS Style Guide

```scss
// 1. Use BEM-like naming
.component {
  &__element {
    // Styles
  }
  
  &--modifier {
    // Styles
  }
}

// 2. Use CSS custom properties
.card {
  padding: var(--space-md);
  background: var(--glass-bg);
}

// 3. Mobile-first media queries
.grid {
  grid-template-columns: 1fr;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

// 4. Order properties logically
.element {
  // Positioning
  position: relative;
  
  // Box model
  display: flex;
  padding: var(--space-md);
  
  // Typography
  font-size: var(--font-size-base);
  
  // Visual
  background: var(--glass-bg);
  border-radius: var(--border-radius);
  
  // Misc
  transition: all var(--t-fast) var(--ease);
}
```

### Commit Message Guide

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test additions/updates
- `chore`: Build/tooling changes

**Examples:**

```bash
feat(profile): add social media links

Add integration with GitHub API to display social media links
dynamically on the profile card.

Closes #42
```

```bash
fix(theme): resolve dark mode contrast issue

Improve color contrast in dark mode to meet WCAG AA standards.
Updated text colors and adjusted glassmorphism opacity.

Fixes #56
```

```bash
docs(readme): update installation instructions

Add detailed setup steps for new contributors including
prerequisite versions and troubleshooting tips.
```

---

## Additional Resources

### Documentation

- [Development Guidelines](./docs/DEVELOPMENT.md)
- [Component Documentation](./docs/COMPONENTS.md)
- [Design System](./docs/DESIGN_SYSTEM.md)

### External Resources

- [Angular Documentation](https://angular.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## Questions?

If you have questions:

1. **Check existing documentation** in the `docs/` folder
2. **Search existing issues** on GitHub
3. **Ask in discussions** or create a new issue
4. **Reach out** to maintainers

Thank you for contributing! 🎉
