# DevRead.me - AI Documentation Generator

Turn your code into professional Docsify documentation with AI analysis.

## Disclaimer

This project, including the core logic and parts of this documentation, is **fully vibe coded**. It serves as a living experiment on how far natural language and AI (GitHub Copilot, Gemini) can take a production-ready web application.

## Features

- AI-powered code analysis using Groq's Llama 3.3 70B
- One-click export to fully functional Docsify documentation
- Custom theme colors and design variations
- Responsive glassmorphism UI built with Tailwind CSS
- Generate complete documentation in ~30 seconds
- Automatic sidebar navigation
- Download as ready-to-deploy ZIP package

## Tech Stack

**Frontend:** Next.js 14, TypeScript, Tailwind CSS, Framer Motion

**Backend:** Next.js API Routes, Node.js, Groq Cloud SDK

**Export:** JSZip, Docsify, Markdown

## Getting Started

**Prerequisites:**

- Node.js 18+
- Groq API key from https://console.groq.com

**Installation:**

```bash
git clone https://github.com/yourusername/devreadme.git
cd devreadme
npm install
```

**Configuration:**

Create `.env.local`:

```env
GROQ_API_KEY=your_groq_api_key_here
```

**Development:**

```bash
npm run dev
# Open http://localhost:3000
```

**Production:**

```bash
npm run build
npm start
```

## Usage

1. Enter your project name and optional description
2. Paste your README, code snippets, or project overview
3. Choose theme color and sidebar preference
4. Click "Generate Documentation"
5. Wait for AI analysis (~30 seconds)
6. Download the ZIP package and extract it
7. Deploy to GitHub Pages, Vercel, Netlify, or any static host

```bash
# To test locally:
unzip MyProject-docs.zip
npx http-server
```

## How It Works

**Pipeline:** User Input → Groq Analysis → Markdown Generation → Template Processing → ZIP Export

**API Endpoint:** `POST /api/generate`

```json
{
  "projectName": "MyProject",
  "description": "Brief description",
  "codeInput": "Your README or code...",
  "accentColor": "#D4AF37",
  "includeSidebar": true
}
```

**Response:** Complete Docsify package with HTML, CSS, and Markdown files

## Project Structure

```
app/              - Next.js App Router
lib/              - Groq, template processing, exports
types/            - TypeScript definitions
hooks/            - React hooks
example-docs/    - Docsify templates
```

## Customization

**Change theme color:** Edit `tailwind.config.ts`

**Modify AI generation:** Update `lib/groq-service.ts`

**Add templates:** Place files in `example-docs/` and update `lib/template-processor.ts`

## Deployment

Deploy the generated ZIP to any static host:

- **Vercel / Netlify** - Connect GitHub, auto-deploy on push
- **GitHub Pages** - Upload extracted files to gh-pages branch
- **Self-hosted** - Run `npm run build && npm start`

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## Environment Variables

`GROQ_API_KEY` - Required for AI analysis

## Troubleshooting

- **"API Key not found"** - Check `.env.local`
- **Generation timeout** - Reduce code input size
- **ZIP not downloading** - Check browser console
- **Styling broken** - Clear cache and restart dev server

## Resources

- [Groq Docs](https://console.groq.com/docs)
- [Docsify Guide](https://docsify.js.org/)
- [Next.js](https://nextjs.org/docs)

## License

MIT

---

For deployment steps, see [DEPLOYMENT.md](DEPLOYMENT.md)

For development details, see [DEVELOPER.md](DEVELOPER.md)
