import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Why I&apos;m Starting This Blog | Bereket Lemma",
  description: "Why I&apos;m starting a blog, what I plan to write about, and what you can expect in future posts.",
}

export default function IntroductionPost() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">

      {/* Back */}
      <Link
        href="/blog"
        className="mb-10 inline-flex items-center gap-2 rounded border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:border-accent hover:text-accent transition-all"
      >
        <ArrowLeft size={14} />
        back to blog
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="rounded border border-border/60 px-2 py-0.5 font-mono text-xs text-muted-foreground">Personal</span>
          <span className="rounded border border-border/60 px-2 py-0.5 font-mono text-xs text-muted-foreground">Writing</span>
          <span className="font-mono text-xs text-muted-foreground sm:ml-auto">March 29, 2026 · 3 min read</span>
        </div>
        <h1 className="font-syne text-3xl font-bold text-foreground">
          Why I&apos;m Starting This Blog
        </h1>
      </div>

      <div className="h-px w-full bg-border/40 mb-10" />

      {/* Content */}
      <div className="flex flex-col gap-6 text-sm leading-relaxed text-muted-foreground">

        <p>
          Hey, I&apos;m <span className="text-accent">Bereket Lemma</span>, a software engineer based in Seattle, WA.
          I&apos;ve been building things for a few years now, from full-stack apps to security tooling to training language models
          and I realized I&apos;ve never really documented what I&apos;m learning along the way. This blog is my way of changing that.
        </p>

        <h2 className="font-syne text-lg font-bold text-foreground mt-2">Why a blog?</h2>

        <p>
          I spend most of my time deep in code, solving problems, and learning new things but almost none of it gets written down.
          The stuff I figure out at 2 AM debugging a deployment or optimizing a query just disappears into the next task.
          I want a place to capture those moments, both for myself and for anyone else who might run into the same problems.
        </p>

        <p>
          Writing also forces me to actually understand what I&apos;m doing. It&apos;s easy to copy a Stack Overflow answer and move on.
          It&apos;s harder to explain <span className="text-accent">why</span> something works. That&apos;s the kind of depth I want to build.
        </p>

        <h2 className="font-syne text-lg font-bold text-foreground mt-2">What I&apos;ll be writing about</h2>

        <p>
          Here&apos;s what you can expect from future posts:
        </p>

        <ul className="list-disc list-inside flex flex-col gap-2 pl-2">
          <li>
            <span className="text-accent">Technical deep dives</span> : breakdowns of real problems I&apos;ve solved at work or in side projects.
            Think system design decisions, debugging war stories, and things I wish someone had explained to me earlier.
          </li>
          <li>
            <span className="text-accent">AI / ML exploration</span> : I&apos;m currently competing in the OpenAI Parameter Golf Challenge,
            training a language model to fit within 16MB. I&apos;ll share what I&apos;m learning about model architecture, quantization, and training efficiency.
          </li>
          <li>
            <span className="text-accent">Life outside of code</span> : lessons from video games, travel stories,
            and whatever else I find interesting enough to write about.
          </li>
          <li>
            <span className="text-accent">Fitness & longevity</span> : what&apos;s working in my workout routine, what&apos;s not,
            and how tech is changing the way we approach exercise and long-term health. Think wearables, recovery data, and the intersection of engineering and physical performance.
          </li>
          <li>
            <span className="text-accent">Career reflections</span> : navigating the tech industry as a new grad, lessons from interviews,
            and honest thoughts on growth as an engineer.
          </li>
        </ul>

        <h2 className="font-syne text-lg font-bold text-foreground mt-2">Who this is for</h2>

        <p>
          Honestly, this is mostly for me. But if you&apos;re a developer who likes reading about how things are actually built,
          or someone early in their career trying to figure things out, I think you&apos;ll find something useful here.
        </p>

        <p>
          If anything I write resonates or you just want to connect, feel free to reach out at{" "}
          <a href="mailto:bereket.lemma10@gmail.com" className="text-accent hover:underline">
            bereket.lemma10@gmail.com
          </a>.
        </p>

        <p className="font-mono text-xs text-muted-foreground/60 mt-4">
            P.S. I can&apos;t promise regular updates, but I can promise that when I do write, it will be something I care about and want to share. Thanks for reading this far!  
        </p>
        <p className="mt-1 text-base text-foreground/70">
          𝒷𝑒𝓇𝑒𝓀𝑒𝓉 𝓁𝑒𝓂𝓂𝒶
        </p>

      </div>

    </main>
  )
}
