# Photocalia API Bruno Collection

This directory contains Bruno API collection for testing the Photocalia API endpoints.

## What is Bruno?

Bruno is a fast and Git-friendly opensource API client. It stores collections directly in folders on your filesystem using a plain text markup language called Bru.

- **Website**: https://www.usebruno.com/
- **GitHub**: https://github.com/usebruno/bruno

## Installation

### Desktop App (Recommended)

1. Download Bruno from https://www.usebruno.com/downloads
2. Install the application for your operating system
3. Open Bruno and select "Open Collection"
4. Navigate to `bruno-collections/photocalia-api` in this repository

### CLI (Optional)

```bash
npm install -g @usebruno/cli
```

## Collection Structure

```
bruno-collections/
└── photocalia-api/
    ├── bruno.json                                        # Collection configuration
    ├── environments/
    │   ├── local.bru                                     # Local environment variables
    │   └── prod.bru                                      # Production environment variables
    ├── test-resources/                                      # Test images for converter
    │   └── README.md
    ├── GitHub User Profile.bru                           # GitHub API test
    ├── Firebase Converter function.bru                   # Original (with base64)
    ├── Firebase Converter function (URL-based).bru       # NEW: Uses URL variable
    ├── Firebase Converter function (Variable-based).bru  # NEW: Uses environment variables
    ├── Firebase Converter function bad image.bru         # Test with invalid image
    ├── Firebase Stats function.bru                       # Statistics API
    ├── Firebase quota function.bru                       # Quota status API
    └── README.md                                         # This file
```

## Available Requests

### API Converter Function (Improved Versions)

We now provide multiple versions of the Converter API test that avoid embedding large base64 images directly in the .bru files:

#### Option 1: URL-based (Recommended)
**File**: `Firebase Converter function (URL-based).bru`

This version automatically fetches an image from a URL and converts it to base64 using a pre-request script.

**Benefits**:
- ✓ No large base64 strings in the file
- ✓ Easy to change test images (just update the URL)
- ✓ Automatic conversion to base64
- ✓ Less error-prone

**Setup**:
1. The `test_image_url` variable is already set in environment files
2. Just run the request - it handles everything automatically!

**How it works**:
```javascript
// Pre-request script fetches image from URL
const imageUrl = bru.getEnvVar('test_image_url');
// Converts to base64 automatically
// Injects into request body
```

#### Option 2: Variable-based (Simpler)
**File**: `Firebase Converter function (Variable-based).bru`

This version uses environment variables for all test data, including the base64-encoded image.

**Benefits**:
- ✓ No scripts needed
- ✓ Works offline
- ✓ Fast execution
- ✓ Full control over test data

**Setup**:
Add variables to your environment file (local.bru or prod.bru):
```
vars {
  test_image_data: data:image/png;base64,YOUR_BASE64_HERE
  test_image_name: edt-test.png
  test_image_type: image/png
  test_timezone: Europe/Paris
  test_date: 2025-10-06
}
```

### Original Version (Legacy)
**File**: `Firebase Converter function.bru`

The original version with embedded base64 data is kept for backward compatibility but is not recommended for new tests.

### GitHub User Profile

Tests the GitHub API endpoint to retrieve user profile information.

**Endpoint**: `https://api.github.com/users/m-idriss`  
**Method**: GET  
**Tests**:
- ✓ Status code is 200
- ✓ Response has login field
- ✓ Login value is "m-idriss"
- ✓ Response is valid JSON

## Running Tests

### Using Bruno Desktop App

1. Open the collection in Bruno
2. Select "GitHub User Profile" request
3. Click "Send" button
4. View the response and test results in the "Tests" tab

### Using Bruno CLI

```bash
# Run all tests in the collection
bru run bruno-collections/photocalia-api

# Run specific request
bru run bruno-collections/photocalia-api --filename "GitHub User Profile.bru"
```

## Adding New Requests

1. Create a new `.bru` file in the `photocalia-api` directory
2. Use the following template:

```
meta {
  name: Request Name
  type: http
  seq: 2
}

get {
  url: https://api.example.com/endpoint
  body: none
  auth: none
}

headers {
  Accept: application/json
}

tests {
  test("Status code is 200", function() {
    expect(res.getStatus()).to.equal(200);
  });
}
```

## Converting Images to Base64

If you need to convert images to base64 for testing, here are several methods:

### Online Tools
- [Base64 Guru](https://base64.guru/converter/encode/image)
- [Base64 Image Encoder](https://www.base64-image.de/)

### Command Line

**Mac/Linux:**
```bash
# Copy to clipboard (Mac)
base64 -i image.png | pbcopy

# Output to terminal (Linux/Mac)
base64 image.png

# Save to file
base64 image.png > image.base64.txt
```

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("image.png"))
```

### Node.js
```javascript
const fs = require('fs');
const base64 = fs.readFileSync('image.png', 'base64');
const dataUrl = `data:image/png;base64,${base64}`;
console.log(dataUrl);
```

### Python
```python
import base64
with open('image.png', 'rb') as f:
    base64_data = base64.b64encode(f.read()).decode('utf-8')
    data_url = f'data:image/png;base64,{base64_data}'
    print(data_url)
```

## Future Additions

Planned requests to add:
- Additional backend API endpoints
- GitHub commits API
- GitHub social accounts API
- Notion API integration

## Documentation

For more information about the API endpoints being tested, see:
- [API Documentation](../../docs/API.md)
- [Services Documentation](../../docs/SERVICES.md)
- [Backend API Repository](https://github.com/m-idriss/3dime-api)

## Contributing

When adding new API tests:
1. Follow the existing naming convention
2. Include comprehensive tests
3. Add documentation in the `docs` section
4. Update this README with the new request information
5. **For image-based tests**: Use URL-based or variable-based approaches instead of embedding base64 data
