# 🏷️ Release Guide

This guide explains how to create tags and releases for the Photocalia project using the automated GitHub Actions workflow.

## 🎯 Quick Start

Creating a new release is simple:

1. Go to your repository on GitHub
2. Click **Actions** tab
3. Select **🏷️ Create Tag and Release** workflow
4. Click **Run workflow** button
5. Choose your options and click **Run workflow**

That's it! The workflow handles everything automatically.

## 📋 Workflow Options

### Version Bump Type

Choose how to increment the version number:

| Option | Current → New | When to Use |
|--------|---------------|-------------|
| **patch** | 1.0.0 → 1.0.1 | Bug fixes, small changes, documentation updates |
| **minor** | 1.0.0 → 1.1.0 | New features that are backwards compatible |
| **major** | 1.0.0 → 2.0.0 | Breaking changes, major refactors |
| **custom** | Any → Custom | Specific version number (e.g., 2.5.0) |

### Custom Version

When you select **custom** as the version type, enter your desired version number in the format `major.minor.patch` (e.g., `1.2.3`).

- ✅ Valid: `1.0.0`, `2.5.3`, `10.0.1`
- ❌ Invalid: `v1.0.0`, `1.0`, `1.0.0-beta`

### Pre-release

Check this option if you're creating a pre-release version (alpha, beta, RC, etc.):

- ☑️ Checked: Marks the release as "Pre-release" on GitHub
- ☐ Unchecked: Creates a normal release

**Note**: Pre-release versions won't be marked as the "Latest" release.

### Include Build Artifacts

Check this option to build the project and attach the compiled files to the release:

- ☑️ Checked: Builds production version and uploads `dist/` as artifact
- ☐ Unchecked: Creates release without building (faster)

Build artifacts are retained for 90 days and can be downloaded from the Actions page.

## 🔄 Workflow Process

When you run the workflow, it performs these steps automatically:

### 1. Version Detection
```
Current version: 0.0.0 (from package.json or latest git tag)
```

### 2. Version Calculation
```
Patch:  0.0.0 → 0.0.1
Minor:  0.0.0 → 0.1.0
Major:  0.0.0 → 1.0.0
Custom: 0.0.0 → 2.5.0 (your choice)
```

### 3. Validation
- ✅ Checks if tag already exists
- ✅ Validates version format
- ✅ Ensures version is newer than current

### 4. Update Files
```bash
# Updates package.json with new version
npm version 1.2.3 --no-git-tag-version
```

### 5. Commit Changes
```bash
# Commits version bump
git commit -m "chore: bump version to 1.2.3"
```

### 6. Create Tag
```bash
# Creates annotated git tag
git tag -a v1.2.3 -m "Release 1.2.3"
```

### 7. Generate Changelog
Automatically categorizes commits since last release:
- 🚀 **Features**: Commits with `feat:` prefix
- 🐛 **Bug Fixes**: Commits with `fix:` prefix
- 📝 **Documentation**: Commits with `docs:` prefix
- 🔧 **Chores**: Commits with `chore:`, `refactor:`, etc.

**New in v2.0.3+**: The changelog now includes:
- ✅ Proper line breaks (no more `\n` characters)
- ✅ Clickable commit links for easy navigation
- ✅ Clean sections - empty categories are hidden
- ✅ Professional markdown formatting

### 8. Create GitHub Release
- Publishes release with auto-generated notes
- Links to tag
- Includes full changelog

### 9. Push Everything
```bash
# Pushes version bump and tag
git push origin HEAD:main
git push origin v1.2.3
```

## 📝 Examples

### Example 1: Bug Fix Release (Patch)

**Scenario**: You fixed a bug in the profile component

**Steps**:
1. Go to Actions → 🏷️ Create Tag and Release
2. Click Run workflow
3. Select:
   - Version type: `patch`
   - Pre-release: Unchecked
   - Include build artifacts: Unchecked
4. Click Run workflow

**Result**:
- Version: 1.0.0 → 1.0.1
- Tag: `v1.0.1`
- Release notes auto-generated with bug fix commits

### Example 2: New Feature Release (Minor)

**Scenario**: You added a new calendar converter feature

**Steps**:
1. Go to Actions → 🏷️ Create Tag and Release
2. Click Run workflow
3. Select:
   - Version type: `minor`
   - Pre-release: Unchecked
   - Include build artifacts: Checked
4. Click Run workflow

**Result**:
- Version: 1.0.1 → 1.1.0
- Tag: `v1.1.0`
- Release with build artifacts attached
- Changelog includes new features section

### Example 3: Major Version (Breaking Changes)

**Scenario**: You upgraded to Angular 21 with breaking changes

**Steps**:
1. Go to Actions → 🏷️ Create Tag and Release
2. Click Run workflow
3. Select:
   - Version type: `major`
   - Pre-release: Unchecked
   - Include build artifacts: Checked
4. Click Run workflow

**Result**:
- Version: 1.1.0 → 2.0.0
- Tag: `v2.0.0`
- Major release marking breaking changes

### Example 4: Beta Release (Pre-release)

**Scenario**: You want to test a new feature before official release

**Steps**:
1. Go to Actions → 🏷️ Create Tag and Release
2. Click Run workflow
3. Select:
   - Version type: `custom`
   - Custom version: `2.0.0-beta.1`
   - Pre-release: Checked
   - Include build artifacts: Checked
4. Click Run workflow

**Result**:
- Version: 1.1.0 → 2.0.0-beta.1
- Tag: `v2.0.0-beta.1`
- Marked as pre-release
- Not shown as "Latest" release

### Example 5: Specific Version

**Scenario**: You need version 3.5.0 for alignment with another project

**Steps**:
1. Go to Actions → 🏷️ Create Tag and Release
2. Click Run workflow
3. Select:
   - Version type: `custom`
   - Custom version: `3.5.0`
   - Pre-release: Unchecked
   - Include build artifacts: Unchecked
4. Click Run workflow

**Result**:
- Version: 2.0.0 → 3.5.0
- Tag: `v3.5.0`
- Custom version as specified

## 🚨 Troubleshooting

### "Tag already exists" Error

**Problem**: You're trying to create a tag that already exists.

**Solution**: 
- Check existing tags: Go to Releases or run `git tag -l`
- Use a different version number
- If you need to update an existing release, delete the tag first:
  ```bash
  git tag -d v1.0.0
  git push origin :refs/tags/v1.0.0
  ```

### "Invalid version format" Error

**Problem**: Version number doesn't match semantic versioning format.

**Solution**: Use format `major.minor.patch` with numbers only:
- ✅ Valid: `1.0.0`, `2.5.3`
- ❌ Invalid: `v1.0.0`, `1.0`, `1.0.0-beta`

**Note**: Pre-release suffixes like `-beta` are not currently supported by the version calculator.

### Workflow Fails to Push

**Problem**: Permission denied when pushing to repository.

**Solution**: Ensure the workflow has write permissions:
1. Go to Settings → Actions → General
2. Under "Workflow permissions", select "Read and write permissions"
3. Re-run the workflow

### Build Artifacts Not Attached

**Problem**: Release doesn't have build artifacts attached.

**Solution**: 
- Make sure you checked "Include build artifacts" option
- Verify the build completed successfully in the workflow logs
- Check the Actions tab for the uploaded artifact

## 🎓 Best Practices

### Semantic Versioning

Follow semantic versioning principles:

- **MAJOR** (x.0.0): Breaking changes
  - API changes that break backwards compatibility
  - Major refactors
  - Dependency updates with breaking changes

- **MINOR** (0.x.0): New features
  - New functionality that's backwards compatible
  - New components or services
  - Significant improvements

- **PATCH** (0.0.x): Bug fixes
  - Bug fixes
  - Security patches
  - Minor tweaks and improvements

### Commit Messages

Use conventional commit format for better changelogs:

```bash
feat: add calendar converter component
fix: resolve profile image loading issue
docs: update installation instructions
chore: upgrade Angular to 20.3
refactor: reorganize service structure
style: format code with Prettier
test: add unit tests for auth service
perf: optimize bundle size
```

This helps the workflow categorize commits in the changelog.

**Example changelog output:**

```markdown
## What's New in v2.1.0

### Changes since v2.0.0

#### 🚀 Features

- feat: add calendar converter component ([abc1234](https://github.com/owner/repo/commit/abc1234))
- feat: implement dark mode toggle ([def5678](https://github.com/owner/repo/commit/def5678))

#### 🐛 Bug Fixes

- fix: resolve profile image loading issue ([ghi9012](https://github.com/owner/repo/commit/ghi9012))

#### 📦 All Commits

- feat: add calendar converter component ([abc1234](https://github.com/owner/repo/commit/abc1234))
- feat: implement dark mode toggle ([def5678](https://github.com/owner/repo/commit/def5678))
- fix: resolve profile image loading issue ([ghi9012](https://github.com/owner/repo/commit/ghi9012))
- chore: update dependencies ([jkl3456](https://github.com/owner/repo/commit/jkl3456))
```

Note: Empty sections (like Documentation or Chores in this example) are automatically hidden.

### Release Frequency

- **Patch releases**: As needed (bug fixes)
- **Minor releases**: Every 2-4 weeks (new features)
- **Major releases**: Every 3-6 months (breaking changes)

### Pre-release Testing

For major changes:
1. Create a pre-release version first (e.g., `2.0.0-beta.1`)
2. Test thoroughly
3. Get feedback from users
4. Create the final release (e.g., `2.0.0`)

## 🔗 Related Resources

- [Semantic Versioning 2.0.0](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Releases Documentation](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 💡 Tips

1. **Tag already exists**: Check existing tags before creating new ones
2. **Version format**: Always use `major.minor.patch` format (numbers only)
3. **Commit messages**: Use conventional commit format for better changelogs
4. **Pre-releases**: Test major changes with pre-release versions first
5. **Build artifacts**: Enable for releases users will download
6. **Workflow logs**: Check Action logs if something goes wrong
7. **Changelog**: Review generated changelog before publishing

## 🤝 Contributing

If you find issues with the release workflow or have suggestions:

1. Open an issue describing the problem or enhancement
2. If you want to contribute, fork and submit a PR
3. Follow the project's contribution guidelines

---

**Questions?** Open an issue or check the [README](README.md) for more information.
