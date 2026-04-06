import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Blog — Bereket Lemma",
  description: "Thoughts on software engineering, security, and building things.",
}

const posts = [
  {
    slug: "llm-inference-bench",
    title: "What I Learned Benchmarking FP16 vs INT4 LLM Inference with vLLM",
    date: "April 6, 2026",
    readTime: "12 min read",
    tags: ["AI", "Benchmarking", "Systems"],
    excerpt:
      "I built a benchmark to answer whether INT4 is truly faster than FP16 in production, and learned why awq_marlin was the turning point.",
  },
  {
    slug: "introduction",
    title: "Why I'm Starting This Blog",
    date: "March 28, 2026",
    readTime: "3 min read",
    tags: ["Personal", "Writing"],
    excerpt:
      "Why I'm starting a blog, what I plan to write about and what you can expect in future posts.",
  },
  {
    slug: "openai-parameter-golf",
    title: "What I'm Learning in the OpenAI Parameter Golf Challenge",
    date: "March 29, 2026",
    readTime: "5 min read",
    tags: ["AI", "Learning"],
    excerpt:
      "Sharing insights and lessons learned from participating in the OpenAI Parameter Golf Challenge.",
  },
]

export default function BlogPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">

      {/* Back */}
      <Link
        href="/"
        className="mb-10 inline-flex items-center gap-2 rounded border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:border-accent hover:text-accent transition-all"
      >
        <ArrowLeft size={14} />
        back to home
      </Link>

      {/* Header */}
      <div className="mb-12 flex items-center gap-4">
        <h1 className="font-syne text-2xl font-bold text-foreground">Blog</h1>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Posts */}
      <div className="flex flex-col gap-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded border border-border/40 p-6 transition-all hover:border-accent/30 hover:bg-surface/50"
          >
            <div className="flex items-start justify-between">
              <h2 className="font-syne text-base font-bold text-foreground group-hover:text-accent transition-colors">
                {post.title}
              </h2>
              <span className="font-mono text-xs text-muted-foreground whitespace-nowrap ml-4">
                {post.readTime}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-border/60 px-2 py-0.5 font-mono text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span className="font-mono text-xs text-muted-foreground">{post.date}</span>
            </div>
          </Link>
        ))}
      </div>

    </main>
  )
}