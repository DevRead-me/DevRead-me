# Deployment Guide

## Platform Options

| Platform | Setup Time | Cost | Scalability | Recommendation |
|----------|-----------|------|-------------|----------------|
| Vercel | 5 min | Free+ | Very high | Best option |
| Netlify | 5 min | Free+ | High | Alternative |
| Railway | 10 min | Pay-as-you-go | Medium | Good |
| Docker/VPS | 30 min | Variable | High | Flexible |
| GitHub Pages | 15 min | Free | Low | Static only |

## Vercel (Recommended)

**Step 1: Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/devreadme.git
git push -u origin main
```

**Step 2: Connect to Vercel**
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "New Project"
4. Select your repository
5. Vercel auto-configures Next.js

**Step 3: Add Environment Variables**
- Go to Project Settings → Environment Variables
- Add `GROQ_API_KEY=your_key`

**Step 4: Deploy**
- Click Deploy
- App runs at https://devreadme.vercel.app

**Auto-deploy:** Every push to main automatically deploys

## Netlify

1. Go to https://netlify.com
2. Click "New site from Git"
3. Select your repository
4. Build command: `npm run build`
5. Publish directory: `.next`
6. Add environment variable: `GROQ_API_KEY=your_key`
7. Deploy

Your site runs at `something.netlify.app`

## Railway

```bash
npm install -g railway
railway link
railway up
railway variables add GROQ_API_KEY="your_key"
railway domain add your-domain.com
```

## Docker

**Build:**
```bash
docker build -t devreadme:latest .
```

**Run locally:**
```bash
docker run -e GROQ_API_KEY="your_key" -p 3000:3000 devreadme:latest
```

**Push to Docker Hub:**
```bash
docker tag devreadme:latest yourusername/devreadme:latest
docker push yourusername/devreadme:latest
```

**Docker Compose:**
```yaml
version: "3.8"
services:
  app:
    image: devreadme:latest
    ports:
      - "3000:3000"
    environment:
      - GROQ_API_KEY=${GROQ_API_KEY}
    restart: unless-stopped
```

```bash
docker-compose up -d
```

## VPS (Ubuntu 22.04)

**Server setup:**
```bash
ssh root@your-vps-ip
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs git npm
npm install -g pm2
```

**Deploy app:**
```bash
git clone https://github.com/yourusername/devreadme.git
cd devreadme
npm install
echo "GROQ_API_KEY=your_key" > .env.local
npm run build
pm2 start "npm start" --name "devreadme"
pm2 save
pm2 startup
```

**Nginx setup:**
```bash
apt install -y nginx certbot python3-certbot-nginx
```

`/etc/nginx/sites-available/default`:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}
```

```bash
systemctl reload nginx
certbot --nginx -d your-domain.com
```

## AWS Amplify

```bash
npm install -g @aws-amplify/cli
amplify init
amplify publish
```

## Pre-Deployment Checklist

- Environment variables set in deployment platform
- `.env.local` not committed to Git
- Local build succeeds: `npm run build`
- Local production test works: `npm start`
- API key is secure (production only)
- SSL/HTTPS enabled
- Monitoring configured (optional)

## Troubleshooting

**Build errors:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**View logs:**
```bash
vercel logs              # Vercel
pm2 logs devreadme      # PM2
docker logs container-id # Docker
```

**Performance:**
```bash
npm run bundle-analyze
```

## Security

**Never commit:**
- `.env.local`
- API keys
- Credentials

**Use platform tools:**
- Vercel: Deployment Protection
- Netlify: Environment Variables
- GitHub: Secrets

**SSL/HTTPS:**
- Vercel & Netlify: Automatic
- VPS: Use Let's Encrypt (free)

## Monitoring (Optional)

- **UptimeRobot** - Uptime monitoring and alerts
- **Sentry** - Error tracking and performance
- **Vercel Analytics** - Built-in analytics dashboard

## Updates

```bash
# Test locally
npm install
npm run build
npm start

# Deploy
git add .
git commit -m "Update"
git push  # Auto-deploys on Vercel/Netlify

# Update dependencies
npm update
npm audit fix
npm run build
```
