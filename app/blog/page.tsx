import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const posts = [
  {
    slug: "introduction",
    title: "Introduction — Who is Bereket?",
    date: "March 28, 2026",
    readTime: "3 min read",
    tags: ["Personal", "Career"],
    excerpt:
      "A quick introduction to who I am, what I build, and where I'm headed. From competitive programming in Spokane to building legal-tech infrastructure and training LLMs.",
  },
]

export default function BlogPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">

      {/* Back */}
      <Link
        href="/"
        className="mb-10 flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-accent transition-colors"
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
            <div className="mt-4 flex items-center justify-between">
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