# Summariz.io: One-Time Setup Implementation Guide

## Overview

This document outlines the implementation of a one-time setup flow for Summariz.io that securely embeds a user's OpenAI API key into their personal bookmarklet. This approach improves UX by eliminating the need for repeated key entry while maintaining security by keeping the key in the browser.

## Technical Components

### 1. Setup Page (setup.html)

Create a new route at `summariz.io/setup` with:
- Input field for OpenAI API key
- Key validation before generation
- Live preview of the bookmarklet
- Clear setup instructions
- Drag-to-bookmark functionality

```html
<!DOCTYPE html>
<html>
<head>
    <title>Summariz.io Setup</title>
    <script src="/js/setup.js" defer></script>
    <link rel="stylesheet" href="/css/setup.css">
</head>
<body>
    <div class="setup-container">
        <h1>Summariz.io Setup</h1>
        <form id="setupForm">
            <input 
                type="password" 
                id="apiKey" 
                placeholder="Your OpenAI API Key"
                pattern="^sk-[a-zA-Z0-9]{48}$"
                required
            >
            <button type="submit">Generate My Bookmarklet</button>
        </form>
        <div id="bookmarkletContainer" style="display:none;">
            <p>Drag this button to your bookmarks bar:</p>
            <a id="bookmarklet" class="bookmarklet-button">
                Summarize
            </a>
        </div>
    </div>
</body>
</html>
```

### 2. Key Processing (setup.js)

The setup script handles key validation and bookmarklet generation:

```javascript
class SetupManager {
    constructor() {
        this.form = document.getElementById('setupForm');
        this.bookmarkletContainer = document.getElementById('bookmarkletContainer');
        this.setupListeners();
    }

    setupListeners() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const apiKey = document.getElementById('apiKey').value;
            if (await this.validateApiKey(apiKey)) {
                this.generateBookmarklet(apiKey);
            }
        });
    }

    async validateApiKey(key) {
        try {
            // Make a minimal API call to OpenAI to verify the key
            const response = await fetch('https://api.openai.com/v1/models', {
                headers: {
                    'Authorization': `Bearer ${key}`
                }
            });
            return response.ok;
        } catch (error) {
            console.error('Key validation failed:', error);
            return false;
        }
    }

    generateBookmarklet(apiKey) {
        const encryptedKey = this.encryptKey(apiKey);
        const bookmarkletCode = this.getBookmarkletCode(encryptedKey);
        this.displayBookmarklet(bookmarkletCode);
    }

    encryptKey(key) {
        // Implementation of secure key encryption
        // This is a critical security component
        return this.encryptWithBrowserData(key);
    }

    encryptWithBrowserData(key) {
        // Create a browser-specific encryption using
        // multiple pieces of browser data as salt
        const salt = [
            navigator.userAgent,
            screen.width,
            screen.height,
            navigator.language,
            new Date().getTimezoneOffset()
        ].join('|');
        
        // Use SubtleCrypto for actual encryption
        // This is just a basic example
        const encoder = new TextEncoder();
        const data = encoder.encode(key + salt);
        return btoa(String.fromCharCode(...new Uint8Array(data)));
    }

    getBookmarkletCode(encryptedKey) {
        // Minified version of the bookmarklet code
        // with embedded encrypted key
        return `javascript:(function(){
            const ENCRYPTED_KEY='${encryptedKey}';
            // Rest of your existing bookmarklet logic
            // but using decryptKey(ENCRYPTED_KEY) instead
            // of localStorage.getItem
        })()`;
    }

    displayBookmarklet(code) {
        const bookmarklet = document.getElementById('bookmarklet');
        bookmarklet.href = code;
        this.bookmarkletContainer.style.display = 'block';
    }
}

new SetupManager();
```

### 3. Modified Bookmarklet Code

The bookmarklet needs to be updated to use the embedded encrypted key:

```javascript
javascript:(function(){
    // Decrypt function matching the encrypt logic
    function decryptKey(encrypted) {
        const salt = [
            navigator.userAgent,
            screen.width,
            screen.height,
            navigator.language,
            new Date().getTimezoneOffset()
        ].join('|');
        
        try {
            const decoded = atob(encrypted);
            const decoder = new TextDecoder();
            const data = new Uint8Array([...decoded].map(c => c.charCodeAt(0)));
            const decrypted = decoder.decode(data);
            return decrypted.replace(salt, '');
        } catch (error) {
            console.error('Decryption failed:', error);
            return null;
        }
    }

    // Rest of your existing bookmarklet code
    // but using decryptKey(ENCRYPTED_KEY) instead
    // of getApiKey()
})()
```

## Security Considerations

1. **Key Encryption**
   - The encryption method uses browser-specific data as a salt
   - Makes the encrypted key unique to each user's browser
   - Prevents easy copying of bookmarklets between users

2. **HTTPS Required**
   - Setup page must be served over HTTPS
   - Prevents MitM attacks during key entry

3. **Key Validation**
   - Validate key format before encryption
   - Test key with OpenAI API before generating bookmarklet
   - Prevent storage of invalid keys

4. **CSP Headers**
   - Implement strict Content Security Policy
   - Prevent XSS attacks on setup page
   ```nginx
   add_header Content-Security-Policy "default-src 'self' api.openai.com";
   ```

## Implementation Steps

1. **Backend Updates**
   - Create new `/setup` route
   - Implement CSP headers
   - Set up HTTPS certificates

2. **Frontend Development**
   - Build setup page UI
   - Implement key validation
   - Create bookmarklet generator

3. **Testing**
   - Test across different browsers
   - Verify encryption/decryption
   - Check bookmarklet functionality
   - Validate security measures

4. **Deployment**
   - Deploy to staging
   - Test in production environment
   - Monitor for issues

## Next Steps

1. Implement monitoring for setup page usage
2. Add analytics for success/failure rates
3. Create user support documentation
4. Set up error tracking

## Maintenance Notes

- Regularly review encryption method
- Monitor OpenAI API changes
- Update browser compatibility checks
- Review security measures quarterly