import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"
import Navbar from "./home/_components/navbar"
import { SectionProvider } from "./section-context"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Bereket Lemma",
  description: "Software Engineer specializing in systems programming, backend infrastructure, and ML systems. ICPC Pacific NW Regionals · Available May 2026.",
  metadataBase: new URL("https://bereketlemma.com"),
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    other: [
      { rel: "icon", url: "/android-chrome-192x192.png", sizes: "192x192" },
      { rel: "icon", url: "/android-chrome-512x512.png", sizes: "512x512" },
    ],
  },
  keywords: ["Software Engineer", "Systems Programming", "LLVM", "ML Infrastructure", "Backend", "GCP", "C++", "Next.js", "New Grad"],
  authors: [{ name: "Bereket Lemma" }],
  openGraph: {
    title: "Bereket Lemma — Software Engineer",
    description: "Systems programming, backend infrastructure, and ML systems. ICPC Pacific NW Regionals · Available May 2026.",
    url: "https://bereketlemma.com",
    siteName: "Bereket Lemma",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Bereket Lemma — Software Engineer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bereket Lemma — Software Engineer",
    description: "Systems programming, backend infrastructure, and ML systems. ICPC Pacific NW Regionals · Available May 2026.",
    images: ["/og-image.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jetbrainsMono.variable} ${inter.variable} font-sans bg-background text-foreground antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Bereket Lemma",
              url: "https://bereketlemma.com",
              jobTitle: "Software Engineer",
              alumniOf: {
                "@type": "CollegeOrUniversity",
                name: "Whitworth University",
              },
              knowsAbout: ["Software Engineering", "Security", "Cloud", "GCP"],
              sameAs: [
                "https://github.com/bereketlemma",
                "https://linkedin.com/in/bereketl",
              ],
            }),
          }}
        />
        <SectionProvider>
          <Navbar />
          <main className="mx-auto max-w-3xl px-6 pt-20">
            {children}
          </main>
        </SectionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}