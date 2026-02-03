# DevRead.me - Developer Guide

Technical documentation for DevRead.me development.

## Overview

DevRead.me is a Next.js web app that transforms code into professional documentation using AI.

**Tech Stack:** Next.js 14 • TypeScript • Tailwind CSS • Groq Cloud API • JSZip

**Pipeline:** User Input → Groq AI → Markdown Generation → Template Processing → ZIP Export

## Architecture

```
Frontend (app/page.tsx) 
    ↓ POST /api/generate
API Route (app/api/generate/route.ts)
    ↓
┌──────────────────┬─────────────────┬──────────────────┐
│ Groq Service     │ Template        │ Export           │
│ (AI Analysis)    │ Processor       │ Service          │
│ (Markdown)       │ (Coloring)      │ (ZIP)            │
└──────────────────┴─────────────────┴──────────────────┘
    ↓
ZIP Bundle (Docsify Package)
```

**Data Flow:**
1. Frontend validates form and sends POST request
2. Backend parses request and calls Groq API
3. Markdown files are generated
4. Templates are processed with theme colors
5. ZIP bundle is created and returned for download

## File Structure

```
app/
  ├── api/generate/route.ts    - API endpoint
  ├── page.tsx                 - Main UI component
  ├── layout.tsx               - Root layout
  └── globals.css              - Global styles

lib/
  ├── groq-service.ts          - Groq API integration
  ├── template-processor.ts    - Template & theme processing
  ├── export-service.ts        - ZIP creation
  └── api-utils.ts             - Frontend utilities

hooks/
  └── useGenerationStatus.ts   - Generation state

types/
  └── index.ts                 - TypeScript definitions

example-docs/                  - Docsify templates
  ├── index.html
  ├── _sidebar.md
  └── themes/docs.css
```

## Key Files

**app/api/generate/route.ts** - Main backend route:
```
Validate Input → Call Groq → Generate Markdown → Process Templates → Create ZIP
```

**lib/groq-service.ts** - AI integration:
```
analyzeCode() → generateDocumentation() → generateCompleteDocumentation()
```

**app/page.tsx** - Frontend UI:
- Glassmorphism design
- Form validation
- API integration
- ZIP download

## Setup

**Requirements:** Node.js 18+

```bash
git clone <repo>
cd devreadme
npm install
```

**Environment:**

```bash
cp .env.local.example .env.local
# Add your GROQ_API_KEY
```

**Development:**

```bash
npm run dev        # Server runs at http://localhost:3000
npm run build      # Production build
npm start          # Run production build
```

## API Reference

### POST `/api/generate`

Generates documentation and creates ZIP package.

**Request:**
```json
{
  "projectName": "string",
  "description": "optional",
  "codeInput": "string (max 50000 chars)",
  "accentColor": "#RRGGBB",
  "includeSidebar": "boolean"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "bundle": {
      "indexHtml": "string",
      "themeCss": "string",
      "markdownFiles": []
    }
  }
}
```

**Status Codes:** 200 (OK), 400 (Bad Request), 500 (Server Error)

## Code Conventions

**TypeScript:**
- Use interfaces for data structures
- Export typed functions
- Use const for all variables
- Avoid 'any' type

**React Components:**
- Functional components with TypeScript
- Use 'use client' directive for client components
- Type hooks properly

**CSS:**
- Use Tailwind classes
- Avoid inline styles

## Debugging

**Console logs:**
```
[API] for backend
[Frontend] for UI
[Groq] for AI integration
```

**Browser DevTools:**
- Network tab: Check POST /api/generate requests
- Console: Look for JavaScript errors
- Elements: Inspect styles

**Common Issues:**
| Issue | Solution |
|-------|----------|
| GROQ_API_KEY not found | Check `.env.local`, restart server |
| ZIP not downloading | Check browser console, allow pop-ups |
| Styling broken | Clear cache, restart dev server |
| API 500 error | Check server logs, verify Groq status |

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

**Quick options:**
- Vercel: Connect GitHub (recommended)
- Netlify: Connect GitHub
- Docker: Build and run containerized
- VPS: Use Node.js and PM2

## Performance

**Frontend:**
- Next.js code splitting
- Tailwind CSS optimization
- Framer Motion (60fps)

**Backend:**
- In-memory ZIP generation
- Minimal API calls to Groq

**Security:**
- GROQ_API_KEY only in `.env.local`
- Input validation on backend
- Never commit secrets
