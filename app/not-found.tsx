import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6">
      <div className="rounded border border-border/40 bg-surface/30 p-8 text-center">
        <div className="mb-4 flex items-center gap-2 justify-center border-b border-border/40 pb-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
          <span className="ml-2 font-mono text-xs text-muted-foreground">404.ts</span>
        </div>
        <p className="font-mono text-sm text-accent mb-2">$ error: page not found</p>
        <p className="font-mono text-xs text-muted-foreground mb-6">
          the route you are looking for does not exist
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded border border-border/60 px-4 py-2 font-mono text-xs text-muted-foreground hover:border-accent hover:text-accent transition-all"
        >
          <ArrowLeft size={14} />
          back to home
        </Link>
      </div>
    </main>
  )
}