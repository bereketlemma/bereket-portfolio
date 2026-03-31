"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import Script from "next/script"
import { ArrowLeft, Send } from "lucide-react"

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string
          callback?: (token: string) => void
          "error-callback"?: () => void
          "expired-callback"?: () => void
          theme?: "light" | "dark" | "auto"
          size?: "normal" | "compact"
        }
      ) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
  }
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const honeypotRef = useRef<HTMLInputElement>(null)

  const renderTurnstile = useCallback(() => {
    if (window.turnstile && turnstileRef.current && !widgetIdRef.current) {
      widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
        callback: (token: string) => setTurnstileToken(token),
        "error-callback": () => setTurnstileToken(null),
        "expired-callback": () => setTurnstileToken(null),
        theme: "dark",
        size: "normal",
      })
    }
  }, [])

  /* If the script loads before the component mounts, render on mount */
  useEffect(() => {
    renderTurnstile()
  }, [renderTurnstile])

  const resetTurnstile = () => {
    if (window.turnstile && widgetIdRef.current) {
      window.turnstile.reset(widgetIdRef.current)
      setTurnstileToken(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          /* honeypot — bots will fill this, humans won't see it */
          website: honeypotRef.current?.value ?? "",
          /* turnstile token for server-side verification */
          "cf-turnstile-response": turnstileToken,
        }),
      })

      if (res.ok) {
        setStatus("success")
        setForm({ name: "", email: "", message: "" })
      } else {
        setStatus("error")
        resetTurnstile()
      }
    } catch {
      setStatus("error")
      resetTurnstile()
    }
  }

  return (
    <>
      {/* Load Turnstile script */}
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={renderTurnstile}
      />

      <main className="mx-auto max-w-3xl px-6 py-24">

        {/* Back */}
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 rounded border border-border/60 px-3 py-1.5 font-mono text-xs text-muted-foreground hover:border-accent hover:text-accent transition-all"
        >
          <ArrowLeft size={14} />
          back to home
        </Link>

        {/* Header */}
        <div className="mb-12 flex items-center gap-4">
          <h1 className="font-syne text-2xl font-bold text-foreground">Get in touch</h1>
          <div className="h-px flex-1 bg-border" />
        </div>

        <p className="mb-8 font-mono text-sm text-muted-foreground">
          Have a question, opportunity, or just want to say hi? Fill out the form and I will get back to you.
        </p>

        {/* Form */}
        <div className="rounded border border-border/40 p-6">

          {/* Terminal header */}
          <div className="mb-6 flex items-center gap-2 border-b border-border/40 pb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
            <span className="ml-2 font-mono text-xs text-muted-foreground">contact.ts</span>
          </div>

          {status === "success" ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="font-mono text-sm text-accent">Message sent successfully!</p>
              <p className="font-mono text-xs text-muted-foreground">
                I will get back to you soon.
              </p>
              <button
                onClick={() => {
                  setStatus("idle")
                  resetTurnstile()
                }}
                className="mt-4 font-mono text-xs text-muted-foreground hover:text-accent transition-colors"
              >
                send another →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* ── Honeypot: hidden from humans, bots will fill it ── */}
              <div className="absolute opacity-0 h-0 w-0 overflow-hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  ref={honeypotRef}
                  type="text"
                  id="website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs text-accent">const name =</label>
                <input
                  type="text"
                  placeholder="your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="rounded border border-border/60 bg-transparent px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs text-accent">const email =</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="rounded border border-border/60 bg-transparent px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs text-accent">const message =</label>
                <textarea
                  placeholder="what's on your mind..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  rows={5}
                  className="rounded border border-border/60 bg-transparent px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Turnstile widget */}
              <div ref={turnstileRef} className="flex justify-center" />

              {/* Submit */}
              <button
                type="submit"
                disabled={status === "loading" || !turnstileToken}
                className="flex items-center justify-center gap-2 rounded border border-accent bg-accent px-5 py-2.5 font-mono text-sm text-background hover:bg-transparent hover:text-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "loading" ? (
                  <span className="animate-pulse">sending...</span>
                ) : (
                  <>
                    <Send size={14} />
                    send message
                  </>
                )}
              </button>

              {!turnstileToken && status !== "loading" && (
                <p className="font-mono text-xs text-muted-foreground/60 text-center">
                  complete the verification above to send
                </p>
              )}

              {status === "error" && (
                <p className="font-mono text-xs text-red-400 text-center">
                  Something went wrong. Try emailing me directly at bereket.lemma10@gmail.com
                </p>
              )}

            </form>
          )}
        </div>

      </main>
    </>
  )
}