"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Send } from "lucide-react"

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setStatus("success")
        setForm({ name: "", email: "", message: "" })
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  return (
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
              I will get back to you at {form.email || "your email"} soon.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-4 font-mono text-xs text-muted-foreground hover:text-accent transition-colors"
            >
              send another →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

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

            {/* Submit */}
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex items-center justify-center gap-2 rounded border border-accent bg-accent px-5 py-2.5 font-mono text-sm text-background hover:bg-transparent hover:text-accent transition-all disabled:opacity-50"
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

            {status === "error" && (
              <p className="font-mono text-xs text-red-400 text-center">
                Something went wrong. Try emailing me directly at bereket.lemma10@gmail.com
              </p>
            )}

          </form>
        )}
      </div>

    </main>
  )
}