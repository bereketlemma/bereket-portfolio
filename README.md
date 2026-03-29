# bereketlemma.com

Personal portfolio of Bereket Lemma: Built with Next.js 14, TypeScript, and Tailwind CSS.

Live at [bereketlemma.com](https://bereketlemma.com).

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Animations | Framer Motion + react-intersection-observer |
| Backend | Firebase (Firestore, Auth) |
| Fonts | JetBrains Mono + Syne |
| Analytics | Vercel Analytics + Speed Insights |
| Deployment | Vercel + Cloudflare DNS |

## Features

- Terminal-style hero with typewriter animation
- Scroll-reveal animations on all sections
- Blog with markdown-style posts
- Resume PDF download
- Admin-ready Firebase backend
- Mobile responsive
- Deployed to custom domain via Vercel + Cloudflare

## Project Structure
```
app/
├── home/_components/     # Hero, Experience, Projects, Skills, Hobbies, Footer
├── blog/                 # Blog index + posts
├── projects/             # All projects page
├── layout.tsx            # Root layout + fonts + metadata
└── page.tsx              # Home page
components/               # Shared UI components
lib/                      # Utilities + project data
public/assets/            # Resume PDF + static files
```

## Getting Started
```bash
git clone https://github.com/bereketlemma/bereket-portfolio.git
cd bereket-portfolio
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env.local` file in the root:
```bash
NEXT_PUBLIC_API_KEY=
NEXT_PUBLIC_AUTH_DOMAIN=
NEXT_PUBLIC_PROJECT_ID=
NEXT_PUBLIC_STORAGE_BUCKET=
NEXT_PUBLIC_MESSAGING_SENDER_ID=
NEXT_PUBLIC_APP_ID=
NEXT_PUBLIC_MEASUREMENT_ID=
```

## Deployment

Deployed to Vercel with automatic deploys on every push to `main`. Custom domain connected via Cloudflare DNS.

## License

MIT