# Testing Guide

> Complete guide to testing Photocalia

## Testing Overview

Photocalia uses a comprehensive testing strategy:
- **Unit Tests**: Jasmine + Karma for component and service testing
- **API Tests**: Bruno for API endpoint testing
- **Manual Testing**: For UI/UX and integration workflows

## Unit Testing

### Running Tests

#### Headless Mode (CI/CD)

```bash
# Run all tests once in headless Chrome
CHROME_BIN=/usr/bin/google-chrome-stable npx ng test --browsers=ChromeHeadless --watch=false
```

**Expected Results:**
- Tests build and execute in < 1 second
- All 61 tests pass successfully ✅
- Clean output with no runtime errors

#### Watch Mode (Development)

```bash
# Run tests in watch mode
npm test

# OR
ng test
```

**Features:**
- Automatic re-run on file changes
- Browser window for debugging
- Live test results
- Source maps for debugging

### Test Structure

```
src/
├── app/
│   ├── components/
│   │   ├── converter/
│   │   │   ├── converter.ts
│   │   │   └── converter.spec.ts        # Component tests
│   │   └── ...
│   ├── services/
│   │   ├── github.service.ts
│   │   └── github.service.spec.ts      # Service tests
│   └── app.spec.ts                     # App tests
```

### Writing Unit Tests

#### Component Tests

Example component test:

```typescript
import { TestBed } from '@angular/core/testing';
import { MyComponent } from './my-component';

describe('MyComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent] // Standalone component
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MyComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should display title', () => {
    const fixture = TestBed.createComponent(MyComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('My Title');
  });
});
```

#### Service Tests

Example service test:

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MyService } from './my.service';

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MyService]
    });
    service = TestBed.inject(MyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch data', (done) => {
    service.getData().subscribe(data => {
      expect(data).toBeDefined();
      done();
    });
  });
});
```

### Test Best Practices

1. **Test Isolation**: Each test should be independent
2. **Descriptive Names**: Use clear, descriptive test names
3. **Arrange-Act-Assert**: Follow AAA pattern
4. **Mock Dependencies**: Use TestBed for dependency injection
5. **Test Behavior**: Focus on what the code does, not how
6. **Keep Tests Fast**: Avoid slow operations in unit tests

### Common Testing Patterns

#### Testing Signals

```typescript
it('should update signal value', () => {
  const component = fixture.componentInstance;
  component.mySignal.set('new value');
  expect(component.mySignal()).toBe('new value');
});
```

#### Testing HTTP Calls

```typescript
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

it('should fetch user data', () => {
  const httpMock = TestBed.inject(HttpTestingController);
  
  service.getUser(1).subscribe(user => {
    expect(user.name).toBe('John');
  });

  const req = httpMock.expectOne('/api/users/1');
  expect(req.request.method).toBe('GET');
  req.flush({ name: 'John' });
});
```

#### Testing Events

```typescript
it('should emit event on click', () => {
  spyOn(component.clicked, 'emit');
  const button = fixture.nativeElement.querySelector('button');
  button.click();
  expect(component.clicked.emit).toHaveBeenCalled();
});
```

### Test Coverage

#### Generate Coverage Report

```bash
# Run tests with coverage
ng test --code-coverage --watch=false

# Coverage report location: coverage/
```

#### View Coverage

Open `coverage/index.html` in a browser to view detailed coverage report.

**Coverage Goals:**
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### Debugging Tests

#### Browser DevTools

1. Run tests in watch mode: `npm test`
2. Click "DEBUG" button in Karma window
3. Open browser DevTools (F12)
4. Set breakpoints in source files
5. Refresh to re-run tests

#### Console Logging

```typescript
it('should calculate correctly', () => {
  const result = component.calculate(2, 3);
  console.log('Result:', result); // Debug output
  expect(result).toBe(5);
});
```

#### Test Isolation

Run specific test:
```typescript
// Use 'fit' instead of 'it' to run only this test
fit('should do something', () => {
  expect(true).toBe(true);
});

// Use 'fdescribe' to run only this test suite
fdescribe('MyComponent', () => {
  // tests...
});
```

## API Testing with Bruno

### Setup Bruno

#### Install Bruno Desktop App
Download from: https://www.usebruno.com/downloads

#### Install Bruno CLI

```bash
npm install -g @usebruno/cli
```

### Available Test Collections

```
bruno-collections/
└── photocalia-api/
    ├── README.md
    ├── GitHub User Profile.bru
    └── test-resources/
        └── README.md
```

### Running API Tests

#### Using Bruno CLI

```bash
# Run all tests in collection
bru run bruno-collections/photocalia-api

# Run specific test
bru run bruno-collections/photocalia-api --filename "GitHub User Profile.bru"

# Run with environment
bru run bruno-collections/photocalia-api --env production
```

#### Using Bruno Desktop App

1. Open Bruno app
2. Open collection: `bruno-collections/photocalia-api`
3. Select test to run
4. Click "Send" button
5. View response and test results

### API Tests Available

#### GitHub User Profile
- **Endpoint**: `https://api.github.com/users/m-idriss`
- **Method**: GET
- **Tests**: 
  - Status code is 200
  - Response contains `login` field

### Creating New API Tests

1. Open Bruno app
2. Create new request
3. Configure:
   - Method (GET, POST, etc.)
   - URL
   - Headers
   - Body (if applicable)
4. Add tests in "Tests" tab
5. Save to collection

Example test:
```javascript
test("should return 200", function() {
  expect(res.status).to.equal(200);
});

test("should have data", function() {
  expect(res.body).to.have.property('data');
});
```

See [Bruno Collection Documentation](../bruno-collections/photocalia-api/README.md) for more details.

## Manual Testing

### Testing Checklist

#### Visual/UI Testing
- [ ] Layout renders correctly on desktop (1920x1080)
- [ ] Layout renders correctly on mobile (375x667)
- [ ] Layout renders correctly on tablet (768x1024)
- [ ] Glassmorphism effects display properly
- [ ] Animations are smooth
- [ ] Colors match design system
- [ ] Text is readable
- [ ] Images load correctly
- [ ] Icons display properly

#### Functionality Testing
- [ ] All links work
- [ ] Navigation functions correctly
- [ ] Forms validate properly
- [ ] Buttons respond to clicks
- [ ] API calls succeed
- [ ] Error messages display
- [ ] Loading states show

#### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

#### PWA Testing
- [ ] Install prompt appears
- [ ] App installs successfully
- [ ] App works offline
- [ ] Service worker registers
- [ ] Share target works (mobile)
- [ ] App shortcuts work
- [ ] Update notifications appear

#### Calendar Converter Testing
- [ ] File upload works (drag & drop)
- [ ] File upload works (browse)
- [ ] Image files process correctly
- [ ] PDF files convert and process
- [ ] AI extraction works
- [ ] Event editing functions
- [ ] Event deletion works
- [ ] ICS download works
- [ ] Batch processing handles multiple files
- [ ] Error handling shows appropriate messages

#### Performance Testing
- [ ] Initial load < 3 seconds (3G)
- [ ] Time to Interactive < 5 seconds
- [ ] No console errors
- [ ] No 404 errors
- [ ] Bundle size acceptable
- [ ] Images optimized

#### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] ARIA labels present
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] Semantic HTML used

### Testing Tools

#### Lighthouse
```bash
# Run Lighthouse audit
npx lighthouse http://localhost:4200 --view
```

Check:
- Performance score
- Accessibility score
- Best Practices score
- SEO score
- PWA compliance

#### Web Vitals

Test Core Web Vitals:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

#### Browser DevTools

Use for:
- Network analysis
- Performance profiling
- Memory leaks
- Console errors
- Responsive testing

### Testing Environments

#### Local Development
```bash
npm start
# Test at http://localhost:4200/
```

#### Production Build
```bash
npm run build -- --configuration=production
npx http-server dist/Photocalia/browser -p 8080
# Test at http://localhost:8080/
```

#### Staging Environment
Test on staging before production deployment

## Continuous Integration (CI)

### GitHub Actions

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Scheduled runs (optional)

### CI Configuration

See `.github/workflows/` for CI workflows:
- Build verification
- Test execution
- Deployment (on success)

### CI Best Practices

1. **Keep Tests Fast**: CI should complete quickly
2. **Fail Fast**: Stop on first failure
3. **Clear Logs**: Easy to debug failures
4. **Consistent Environment**: Match production
5. **Automated Checks**: Linting, testing, building

## Test Data

### Mock Data

Store test data in:
- `src/app/testing/` (create if needed)
- Component `.spec.ts` files
- Service `.spec.ts` files

Example:
```typescript
export const MOCK_USER = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com'
};
```

### Test Resources

API test resources:
- `bruno-collections/photocalia-api/test-resources/`

## Troubleshooting Tests

### Tests Fail to Run

**Issue**: Karma won't start

**Solutions**:
- Check Chrome/Chromium is installed
- Set `CHROME_BIN` environment variable
- Check port 9876 is available
- Clear karma cache

### Tests Pass Locally but Fail in CI

**Solutions**:
- Check environment differences
- Verify dependencies are installed
- Check for timing issues
- Review CI logs carefully

### Flaky Tests

Tests that sometimes pass, sometimes fail:

**Solutions**:
- Add proper waits for async operations
- Use `fakeAsync` and `tick()` for timing
- Mock time-dependent code
- Increase timeouts if needed

### Coverage Too Low

**Solutions**:
- Identify untested code in coverage report
- Write tests for critical paths
- Test edge cases
- Mock external dependencies

## Performance Testing

### Bundle Analysis

```bash
# Analyze bundle size
npm run build -- --configuration=production --stats-json
npx webpack-bundle-analyzer dist/Photocalia/browser/stats.json
```

### Load Testing

For API endpoints:
```bash
# Install Apache Bench
apt-get install apache2-utils

# Test endpoint
ab -n 1000 -c 10 https://your-api.com/endpoint
```

## Security Testing

### Dependency Vulnerabilities

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# View detailed report
npm audit --json
```

### Code Security Scanning

Use GitHub's CodeQL or similar tools to scan for:
- SQL injection
- XSS vulnerabilities
- Insecure dependencies
- Exposed secrets

## Testing Best Practices Summary

✅ **Do:**
- Write tests for new features
- Test edge cases
- Use descriptive test names
- Keep tests independent
- Mock external dependencies
- Run tests before committing
- Maintain good coverage

❌ **Don't:**
- Skip testing critical paths
- Write tests that depend on each other
- Test implementation details
- Ignore failing tests
- Commit code with failing tests
- Test third-party libraries

## Getting Help

Issues with testing?

1. Check this guide
2. Review test error messages
3. Check [Angular Testing Guide](https://angular.dev/guide/testing)
4. Search GitHub Issues
5. Create new issue with test details

---

**Related Documentation:**
- [Development Guidelines](./DEVELOPMENT.md)
- [Component Documentation](./COMPONENTS.md)
- [Services Documentation](./SERVICES.md)
- [Contributing Guidelines](../CONTRIBUTING.md)
