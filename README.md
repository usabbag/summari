# Summariz.io

<p align="center">
  <img src="assets/summarizio.png" width="120" alt="Summarizio Logo">
</p>

Instant 200-word webpage summaries powered by Claude, Anthropic's AI assistant.

## Quick Setup

1. Get an API key from [console.anthropic.com](https://console.anthropic.com/)
2. Visit [summariz.io](https://summariz.io)
3. Enter your API key and click "Generate"
4. Drag the bookmarklet to your bookmarks bar

## Features

- **One-click summaries** - Works on any webpage, no extensions or apps needed
- **Powered by Claude** - Dense, meaningful summaries via Claude Sonnet 4.5
- **Smart extraction** - Summarizes via URL or page text as fallback
- **Private & at-cost** - Direct API calls through your Anthropic account

## Installation

### Desktop
- Show your bookmarks bar (Cmd+Shift+B on Mac, Ctrl+Shift+B on Windows)
- Drag the "+Summarize" button to your bookmarks bar

### iOS Safari
1. Generate your bookmarklet on summariz.io
2. Copy the bookmarklet code
3. Add a new bookmark in Safari
4. Paste the code as the URL

## Tech Stack

- **Backend**: Cloudflare Workers
- **AI**: Claude Sonnet 4.5 via Anthropic API
- **Frontend**: Static HTML/CSS/JS

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions.
