#!/usr/bin/env node

/**
 * DevRead.me - Command Reference
 * Schnelle Übersicht aller wichtigen Befehle
 */

console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                     🚀 DevRead.me - Quick Reference                       ║
║              AI-Powered Documentation Generator mit Groq Cloud             ║
╚════════════════════════════════════════════════════════════════════════════╝

📝 SETUP & INSTALLATION
─────────────────────────────────────────────────────────────────────────────
  Windows:  setup.bat              (Automated setup with menu)
  Linux:    bash setup.sh           (Automated setup with menu)
  Manual:   npm install             (Manual installation)

⚙️  DEVELOPMENT
─────────────────────────────────────────────────────────────────────────────
  npm run dev          Start development server (http://localhost:3000)
  npm run build        Build for production
  npm start            Start production server
  npm run lint         Run ESLint

🔧 PROJECT SCRIPTS
─────────────────────────────────────────────────────────────────────────────
  npm install          Install all dependencies
  npm update           Update dependencies
  npm audit fix        Fix security vulnerabilities

📚 DOCUMENTATION LINKS
─────────────────────────────────────────────────────────────────────────────
  README.md            User guide & features overview
  DEVELOPER.md         Technical documentation for developers
  DEPLOYMENT.md        Deployment guides for all platforms
  PROJECT_SUMMARY.md   Complete project structure overview

🚀 DEPLOYMENT
─────────────────────────────────────────────────────────────────────────────
  Vercel:   Connect GitHub → Auto-deploy ⭐ Recommended
  Netlify:  Connect GitHub → Auto-deploy ✅ Good
  Docker:   docker build . && docker run ...
  Railway:  railway link && railway up
  Linux:    npm run build && npm start

📂 KEY FILES
─────────────────────────────────────────────────────────────────────────────
  app/page.tsx              Main UI component with glassmorphism design
  app/api/generate/route.ts API endpoint for documentation generation
  lib/groq-service.ts       Groq AI integration (analysis + generation)
  lib/template-processor.ts Docsify template manipulation
  lib/export-service.ts     ZIP bundling and export logic
  types/index.ts            TypeScript type definitions

🔐 ENVIRONMENT VARIABLES
─────────────────────────────────────────────────────────────────────────────
  .env.local
  ├── GROQ_API_KEY=your_api_key_here  (Required)
  └── Get key from: https://console.groq.com/keys

🌐 LIVE API ENDPOINTS
─────────────────────────────────────────────────────────────────────────────
  POST /api/generate
  {
    "projectName": "string",
    "description": "string",
    "codeInput": "string",
    "accentColor": "#RRGGBB",
    "includeSidebar": boolean
  }
  
  Response:
  {
    "success": true,
    "data": {
      "bundle": {
        "indexHtml": "...",
        "themeCss": "...",
        "markdownFiles": [...]
      }
    }
  }

🎨 TECH STACK
─────────────────────────────────────────────────────────────────────────────
  Frontend:     Next.js 14, TypeScript, Tailwind CSS, Framer Motion
  Backend:      Next.js API Routes, Node.js
  AI:           Groq Cloud (llama-3.3-70b-versatile)
  Export:       JSZip, Docsify
  Icons:        Lucide React

🔄 GENERATION PIPELINE
─────────────────────────────────────────────────────────────────────────────
  1. User Input           → projectName, code, color, settings
  2. Frontend Validation  → Check format & length
  3. API Call             → POST /api/generate
  4. Groq Analysis        → Extract structure & features
  5. Groq Generation      → Create README, API, etc.
  6. Template Processing  → Apply colors & settings
  7. ZIP Creation         → Bundle all files
  8. Browser Download     → User receives ZIP

💡 COMMON TASKS
─────────────────────────────────────────────────────────────────────────────

  Start development:
  $ npm run dev

  Build production version:
  $ npm run build
  $ npm start

  Generate documentation for a project:
  1. Open http://localhost:3000
  2. Enter project details
  3. Click "Generate Documentation"
  4. Download ZIP package

  Deploy to Vercel:
  1. Push to GitHub
  2. Connect repo to vercel.com
  3. Set GROQ_API_KEY in environment variables
  4. Auto-deployed! 🎉

🐛 DEBUGGING
─────────────────────────────────────────────────────────────────────────────
  Check logs:        npm run dev (watch console)
  Browser DevTools:  F12 → Console & Network tabs
  API Response:      Chrome DevTools → Network → /api/generate
  TypeScript Errors: npm run build (catches TS errors)

📊 MONITORING
─────────────────────────────────────────────────────────────────────────────
  Vercel:   vercel.com/analytics
  Sentry:   sentry.io (error tracking)
  UptimeRobot: uptimerobot.com (uptime monitoring)

🔗 USEFUL LINKS
─────────────────────────────────────────────────────────────────────────────
  Groq Console:        https://console.groq.com
  Groq API Docs:       https://console.groq.com/docs
  Docsify Guide:       https://docsify.js.org
  Next.js Docs:        https://nextjs.org/docs
  Tailwind CSS:        https://tailwindcss.com
  TypeScript Docs:     https://www.typescriptlang.org

⚡ PERFORMANCE TIPS
─────────────────────────────────────────────────────────────────────────────
  • Keep code input under 10KB for faster processing
  • Use specific project descriptions for better output
  • Cache results for repeated requests (future feature)
  • Monitor Groq API rate limits (30 req/min on free tier)

🆘 TROUBLESHOOTING
─────────────────────────────────────────────────────────────────────────────

  Problem: "GROQ_API_KEY not found"
  Solution: Create/update .env.local with your API key

  Problem: "ZIP not downloading"
  Solution: Check browser console for errors, verify pop-ups enabled

  Problem: "Build fails"
  Solution: rm -rf node_modules && npm install && npm run build

  Problem: "API 500 Error"
  Solution: Check Groq API status at console.groq.com

  Problem: "Styling looks broken"
  Solution: Clear browser cache (Ctrl+Shift+Delete) and restart dev server

✨ FEATURES
─────────────────────────────────────────────────────────────────────────────
  ✅ AI-powered code analysis with Groq
  ✅ Automatic documentation generation
  ✅ Docsify integration & packaging
  ✅ Customizable accent colors
  ✅ Sidebar navigation toggle
  ✅ Modern glassmorphism UI
  ✅ One-click ZIP export
  ✅ Responsive design
  ✅ Dark mode default
  ✅ Type-safe TypeScript

📈 PROJECT METRICS
─────────────────────────────────────────────────────────────────────────────
  TypeScript/TSX Files:  6 files (~1500 LOC)
  Configuration Files:   5 files (~200 LOC)
  Documentation:         3 files (~1200 LOC)
  Stylesheets:          2 files (~800 LOC)
  Templates:            4 files (~800 LOC)
  ───────────────────────────────────────
  Total:               20 files (~5900 LOC)

📧 SUPPORT & CONTACT
─────────────────────────────────────────────────────────────────────────────
  GitHub Issues:       https://github.com/yourusername/devreadme/issues
  Documentation:       See README.md, DEVELOPER.md, DEPLOYMENT.md
  Email:              support@devreadme.jumpstone4477.de

╔════════════════════════════════════════════════════════════════════════════╗
║  Version 1.0.0 | Status: 🟢 Production Ready | Last Updated: Feb 2026      ║
║          Made with ❤️ for Developers | Powered by Groq Cloud               ║
╚════════════════════════════════════════════════════════════════════════════╝

🎯 GET STARTED NOW:
  1. npm install
  2. Edit .env.local with your GROQ_API_KEY
  3. npm run dev
  4. Open http://localhost:3000
  5. Start generating docs! 🚀

`);
