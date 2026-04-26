"use client"

import { useInView } from "react-intersection-observer"
import { useEffect } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion, useAnimation } from "framer-motion"


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
          transition: { delay: 0.15 + index * 0.12, duration: 0.5, ease: "easeOut" },
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

export default function Posts() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 })

  return (
    <section ref={ref} id="posts" className="py-8 lg:py-16">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="mb-12 flex items-center gap-4"
      >
        <span className="font-mono text-sm text-accent">04.</span>
        <h2 className="font-syne text-2xl font-bold text-foreground">Posts</h2>
        <div className="h-px flex-1 bg-border" />
      </motion.div>

      {/* Post cards */}
      <div className="grid gap-4">
        {latestPosts.map((post, i) => (
          <PostCard key={post.slug} post={post} index={i} isInView={inView} />
        ))}
      </div>

    </section>
  )
}
