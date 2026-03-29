import Link from "next/link"
import { Github, Linkedin, Mail } from "lucide-react"

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-border/40 py-12">
      <div className="flex flex-col gap-8">

        {/* Top row */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

          {/* Left: identity */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-syne text-lg font-bold text-foreground">Bereket Lemma</span>
            </div>
            <p className="font-mono text-xs text-muted-foreground">Software Engineer · Seattle, WA</p>
            <p className="font-mono text-xs text-accent mt-1">bereket.lemma10@gmail.com</p>
          </div>

          {/* Right: links */}
          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs text-muted-foreground/50 uppercase tracking-widest">Connect</p>
            <div className="flex flex-col gap-1.5">
              <Link
                href="https://github.com/bereketlemma"
                target="_blank"
                className="flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-accent transition-colors"
              >
                <Github size={12} />
                github.com/bereketlemma
              </Link>
              <Link
                href="https://linkedin.com/in/bereketl"
                target="_blank"
                className="flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-accent transition-colors"
              >
                <Linkedin size={12} />
                linkedin.com/in/bereketl
              </Link>
              <Link
                href="mailto:bereket.lemma10@gmail.com"
                className="flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-accent transition-colors"
              >
                <Mail size={12} />
                bereket.lemma10@gmail.com
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-border/40" />

        {/* Bottom row */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-xs text-muted-foreground">
            <span className="text-accent">bereket@lemma:~$</span> built with Next.js · TypeScript · Tailwind · Firebase
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} Bereket Lemma — bereketlemma.com
          </p>
        </div>

      </div>
    </footer>
  )
}