# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Summariz.io is a bookmarklet-based webpage summarization tool. Users install a bookmarklet that sends page content to a Cloudflare Worker backend, which uses Claude Sonnet 4.5 to generate 200-word summaries.

## Commands

```bash
npm run dev      # Start local development server (wrangler dev)
npm run deploy   # Deploy worker to Cloudflare
npm run tail     # View live worker logs
```

## Architecture

### Frontend (index.html)
- Static landing page hosted separately (e.g., Cloudflare Pages)
- Generates personalized bookmarklets with user's Anthropic API key encoded via btoa()
- Validates API keys start with `sk-ant-`

### Bookmarklet (bookmarklets/summarize-bookmarklet.js)
- Injected JavaScript that runs on any webpage
- Extracts page URL or falls back to innerText if URL fetch fails
- Sends content to worker with API key in `X-Anthropic-Key` header
- Displays summary in an overlay modal

### Worker Backend (worker/index.js)
- Cloudflare Worker using `@anthropic-ai/sdk`
- Model: `claude-sonnet-4-5-20250929`
- Accepts POST requests with `{url, text}` body
- CORS enabled for bookmarklet cross-origin requests
- API key passed through from client (no server-side key storage)

### Data Flow
```
Bookmarklet → POST to Worker → Claude API → Summary returned → Modal displayed
```

The bookmarklet first tries summarizing via URL (worker fetches content). If that fails (CORS, auth walls), it falls back to sending extracted page text directly.

## Key Files

- `worker/index.js` - Cloudflare Worker entry point
- `index.html` - Landing page with bookmarklet generator
- `bookmarklets/summarize-bookmarklet.js` - Source bookmarklet (readable version)
- `wrangler.toml` - Cloudflare Worker configuration

## Worker URL

Production: `https://summari-worker.ulysse.workers.dev`
