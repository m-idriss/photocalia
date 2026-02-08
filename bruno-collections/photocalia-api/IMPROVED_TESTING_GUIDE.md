# Firebase Converter Function - Improved Testing Guide

## Problem Statement

The original "Firebase Converter function.bru" file contained a huge base64-encoded image directly embedded in the file, which caused several issues:
- **Large file size**: The file was extremely heavy due to the embedded base64 data
- **Error-prone**: Editing the file could easily corrupt the base64 string
- **Hard to maintain**: Changing the test image required replacing the entire base64 string
- **Time-consuming**: Developers had to encode images manually before testing

## Solution Overview

We've created two improved versions that eliminate the need to embed base64 data directly in the .bru files:

### Option 1: URL-based Approach (Recommended) 🌟

**File**: `Firebase Converter function (URL-based).bru`

This version automatically fetches an image from a URL and converts it to base64 using a pre-request script.

#### How It Works
1. The `test_image_url` variable is defined in the environment file
2. A pre-request script runs before the request
3. The script fetches the image from the URL
4. It converts the image to base64 format automatically
5. The converted data is injected into the request body

#### Advantages
- ✅ **No large files**: The .bru file stays small and readable
- ✅ **Easy to update**: Just change the URL variable to test different images
- ✅ **Automatic conversion**: No manual base64 encoding needed
- ✅ **Less error-prone**: No risk of corrupting base64 data
- ✅ **Version control friendly**: Clean diffs and smaller commits

#### Usage
```javascript
// Environment variable (already set in local.bru and prod.bru)
test_image_url: https://raw.githubusercontent.com/m-idriss/Photocalia/main/bruno-collections/photocalia-api/test-resources/edt-test.pdf

// The pre-request script handles everything automatically!
// Just click "Send" and the image will be fetched and converted
```

### Option 2: Variable-based Approach (Simpler)

**File**: `Firebase Converter function (Variable-based).bru`

This version uses environment variables for all test data, including the base64-encoded image.

#### How It Works
1. You define all test parameters as environment variables
2. The request body references these variables
3. Bruno substitutes the values when sending the request

#### Advantages
- ✅ **No scripts**: Simpler, just pure variables
- ✅ **Works offline**: No network requests during execution
- ✅ **Fast**: No conversion overhead
- ✅ **Full control**: Manually set all test parameters

#### Usage
Add these variables to your environment file:
```
vars {
  test_image_data: data:image/png;base64,YOUR_BASE64_HERE
  test_image_name: edt-test.png
  test_image_type: image/png
  test_timezone: Europe/Paris
  test_date: 2025-10-06
}
```

## Quick Start

### Using URL-based (Easiest)
1. Open Bruno
2. Load the collection
3. Select "Firebase Converter function (URL-based)"
4. Click "Send" - that's it! ✨

### Using Variable-based
1. Convert your image to base64 (see conversion methods below)
2. Add the `test_image_data` variable to your environment
3. Select "Firebase Converter function (Variable-based)"
4. Click "Send"

## Converting Images to Base64

### Command Line (Quickest)
```bash
# Mac/Linux
base64 -i image.png

# Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("image.png"))
```

### Online Tools (Easiest)
- [Base64 Guru](https://base64.guru/converter/encode/image)
- [Base64 Image Encoder](https://www.base64-image.de/)

### Node.js (For Automation)
```javascript
const fs = require('fs');
const base64 = fs.readFileSync('image.png', 'base64');
const dataUrl = `data:image/png;base64,${base64}`;
```

## File Comparison

| Aspect | Original | URL-based | Variable-based |
|--------|----------|-----------|----------------|
| File size | ~70KB | ~3KB | ~3KB |
| Ease of use | ❌ Hard | ✅ Very Easy | ✅ Easy |
| Maintenance | ❌ Difficult | ✅ Very Easy | ✅ Easy |
| Error risk | ❌ High | ✅ Low | ✅ Low |
| Setup time | 5+ min | 10 sec | 2 min |
| Works offline | ✅ Yes | ❌ No | ✅ Yes |
| Requires script | ❌ No | ✅ Yes | ❌ No |

## Recommendation

For most users, we recommend the **URL-based approach** because:
- No manual encoding needed
- Easy to switch test images
- Clean and maintainable
- Minimal setup time

Use the **Variable-based approach** if:
- You need to work offline
- You prefer simpler configuration without scripts
- You want more control over all parameters

## Migration Guide

If you're currently using the original file:

1. **Backup** (optional): Keep the original file as reference
2. **Choose** one of the new approaches
3. **Update** environment variables if needed
4. **Test** with the new file
5. **Delete** or archive the original file

That's it! No complex migration needed.

## Support

For questions or issues:
- Check the [Bruno documentation](https://docs.usebruno.com/)
- Review the test-resources/README.md for more details
- Create an issue in the repository

---

**Happy Testing!** 🚀
