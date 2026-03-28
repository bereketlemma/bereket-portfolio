import type { Metadata } from "next"
import { JetBrains_Mono, Syne } from "next/font/google"
import "./globals.css"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
})

export const metadata: Metadata = {
  title: "Bereket Lemma",
  description: "Software Engineer · Security · Cloud",
  keywords: ["Software Engineer", "Security", "Cloud", "GCP", "Next.js"],
  authors: [{ name: "Bereket Lemma" }],
  openGraph: {
    title: "Bereket Lemma",
    description: "Software Engineer · Security · Cloud",
    url: "https://bereketlemma.com",
    siteName: "Bereket Lemma",
    type: "website",
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
        className={`${jetbrainsMono.variable} ${syne.variable} font-mono bg-background text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  )
}