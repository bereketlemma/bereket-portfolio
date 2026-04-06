"use client"

import { motion, useAnimation } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

/* ── Update this array whenever you publish a new post ── */
const latestPosts = [
  {
    slug: "llm-inference-bench",
    title: "What I Learned Benchmarking FP16 vs INT4 LLM Inference with vLLM",
    date: "2026-04-06",
    excerpt: "I built a benchmark to answer whether INT4 is truly faster than FP16 in production, and learned why awq_marlin was the turning point.",
    tags: ["AI", "Benchmarking"],
  },
  {
    slug: "openai-parameter-golf",
    title: "What I'm Learning in the OpenAI Parameter Golf Challenge",
    date: "2026-03-29",
    excerpt: "Sharing insights and lessons learned from participating in the OpenAI Parameter Golf Challenge.",
    tags: ["AI", "Learning"],
  },
  {
    slug: "introduction",
    title: "Why I'm Starting This Blog",
    date: "2026-03-28",
    excerpt: "Why I'm starting a blog, what I plan to write about and what you can expect in future posts.",
    tags: ["Personal", "Writing"],
  },
]

/* ── Terminal typing line component ── */
function TerminalLine({
  children,
  delay,
  prefix = "$",
}: {
  children: React.ReactNode
  delay: number
  prefix?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="flex gap-2 font-mono text-sm leading-relaxed"
    >
      <span className="text-accent select-none shrink-0">{prefix}</span>
      <span>{children}</span>
    </motion.div>
  )
}

/* ── Blog post card ── */
function PostCard({
  post,
  index,
  isInView,
}: {
  post: (typeof latestPosts)[0]
  index: number
  isInView: boolean
}) {
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { delay: 0.6 + index * 0.2, duration: 0.5, ease: "easeOut" },
        },
      }}
      initial="hidden"
      animate={controls}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="group block rounded-lg border border-border/40 bg-surface/50 p-5 transition-all hover:border-accent/60 hover:bg-surface/80"
      >
        {/* Date + tags */}
        <div className="mb-2 flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
          <span>{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          <span className="text-border">·</span>
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-border/40 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="mb-1.5 font-syne text-base font-semibold text-foreground group-hover:text-accent transition-colors">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="mb-3 font-mono text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {post.excerpt}
        </p>

        {/* Read more */}
        <span className="inline-flex items-center gap-1 font-mono text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity">
          read more <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </span>
      </Link>
    </motion.div>
  )
}

/* ── Main section ── */
export default function LatestPost() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 })
  const [showCursor, setShowCursor] = useState(true)

  /* Blinking cursor effect */
  useEffect(() => {
    const interval = setInterval(() => setShowCursor((v) => !v), 530)
    return () => clearInterval(interval)
  }, [])

  return (
    <section ref={ref} id="blog" className="mx-auto max-w-3xl px-6 py-24">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <p className="mb-1 font-mono text-xs text-accent">06</p>
        <h2 className="font-syne text-2xl font-bold text-foreground">Blog</h2>
      </motion.div>

      {/* Terminal block */}
      {inView && (
        <div className="mb-8 rounded-lg border border-border/40 bg-[#0a0a0a] p-4 overflow-hidden">
          {/* Terminal dots */}
          <div className="mb-3 flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
          </div>

          <div className="space-y-1.5 text-muted-foreground">
            <TerminalLine delay={0.1}>
              <span className="text-foreground">fetch</span>{" "}
              <span className="text-accent">--latest</span> blog
            </TerminalLine>

            <TerminalLine delay={0.35} prefix=">">
              <span className="text-green-400">200 OK</span>{" "}
              <span className="text-muted-foreground">
                — found {latestPosts.length} post{latestPosts.length !== 1 && "s"}
              </span>
            </TerminalLine>

            <TerminalLine delay={0.5} prefix=">">
              <span className="text-muted-foreground">rendering posts...</span>
              <span className={`ml-0.5 ${showCursor ? "opacity-100" : "opacity-0"} text-accent transition-opacity`}>
                ▊
              </span>
            </TerminalLine>
          </div>
        </div>
      )}

      {/* Post cards */}
      <div className="grid gap-4">
        {latestPosts.map((post, i) => (
          <PostCard key={post.slug} post={post} index={i} isInView={inView} />
        ))}
      </div>

      {/* View all link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 1.2, duration: 0.4 }}
        className="mt-6 text-center"
      >
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 font-mono text-sm text-muted-foreground hover:text-accent transition-colors"
        >
          view all posts <ArrowRight size={14} />
        </Link>
      </motion.div>
    </section>
  )
}
