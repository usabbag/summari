# Cloudflare Workers Deployment Guide

This guide will help you deploy the Summariz.io backend to Cloudflare Workers.

## Prerequisites

- Node.js installed (v16 or later)
- A Cloudflare account (free tier works)
- An OpenAI API key (for testing)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Login to Cloudflare

```bash
npx wrangler login
```

This will open a browser window to authenticate with your Cloudflare account.

## Step 3: Deploy the Worker

```bash
npm run deploy
```

After deployment, Wrangler will output your worker URL. It will look like:
```
https://summari-worker.YOUR_SUBDOMAIN.workers.dev
```

## Step 4: Update Frontend URLs

Replace `YOUR_SUBDOMAIN` with your actual Cloudflare subdomain in:

1. **index.html** (line ~177) - Update the fetch URL in the bookmarklet code
2. **bookmarklets/summarize-bookmarklet.js** (line 61) - Update the fetch URL

Example:
```javascript
// Replace this:
"https://summari-worker.YOUR_SUBDOMAIN.workers.dev"

// With your actual URL:
"https://summari-worker.myaccount.workers.dev"
```

## Step 5: Set Up OpenAI API Key (Optional)

If you want to store an OpenAI API key in the worker environment (not recommended for this use case since users provide their own keys), you can set a secret:

```bash
npx wrangler secret put OPENAI_API_KEY
```

## Step 6: Test Your Worker

Test the deployment by:

1. Opening `index.html` in a browser
2. Entering an OpenAI API key
3. Generating and using the bookmarklet on any webpage

## Custom Domain (Optional)

To use a custom domain like `api.summariz.io`:

1. Go to your Cloudflare dashboard
2. Navigate to Workers & Pages > Your Worker > Settings > Triggers
3. Add a custom domain or route
4. Update the URLs in steps 4 above to use your custom domain

## Development

To run the worker locally for testing:

```bash
npm run dev
```

This starts a local development server at `http://localhost:8787`.

## Troubleshooting

### CORS Errors
The worker is configured to allow CORS from any origin. If you experience issues:
- Check that the worker URL is correct
- Verify the request includes the `X-OpenAI-Key` header

### API Key Issues
- Ensure API keys start with `sk-`
- The encryption/decryption logic in the worker matches the frontend encoding

### Deployment Fails
- Run `npx wrangler whoami` to verify you're logged in
- Check that your Cloudflare account has Workers enabled
- Free tier accounts have a limit on the number of workers

## Monitoring

View your worker logs in real-time:

```bash
npm run tail
```

Or visit the Cloudflare dashboard:
Workers & Pages > Your Worker > Logs
