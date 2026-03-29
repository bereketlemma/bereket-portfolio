import Link from "next/link"
import { ArrowLeft } from "lucide-react"

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
        <div className="mb-3 flex items-center gap-3">
          <span className="rounded border border-border/60 px-2 py-0.5 font-mono text-xs text-muted-foreground">Personal</span>
          <span className="rounded border border-border/60 px-2 py-0.5 font-mono text-xs text-muted-foreground">Career</span>
          <span className="font-mono text-xs text-muted-foreground ml-auto">March 28, 2026 · 3 min read</span>
        </div>
        <h1 className="font-syne text-3xl font-bold text-foreground">
          Introduction — Who is Bereket?
        </h1>
      </div>

      <div className="h-px w-full bg-border/40 mb-10" />

      {/* Content */}
      <div className="flex flex-col gap-6 text-sm leading-relaxed text-muted-foreground">

        <p>
          Hey — I'm <span className="text-foreground font-medium">Bereket Lemma</span>, a software engineer based in Seattle, WA.
          I graduated from Whitworth University in December 2025 with a B.S. in Computer Science and Applied Mathematics.
        </p>

        <p>
          I've been writing code seriously since my freshman year, starting with competitive programming.
          In 2025, my team placed <span className="text-accent">3rd at the ICPC Pacific Northwest Regional</span> — one of the highlights of my undergrad years.
          There's something about solving hard problems under pressure with a team that never gets old.
        </p>

        <p>
          On the professional side, I interned as a <span className="text-accent">Security Engineer at Washington Trust Bank</span>,
          where I automated vulnerability monitoring workflows that saved the team 80+ hours a week.
          I also worked as a <span className="text-accent">Full-Stack Engineer at Hewitt Learning</span>, building REST APIs and automating report generation.
        </p>

        <p>
          I'm currently a <span className="text-accent">Founding Engineer at Celeri.io</span> — a legal-tech startup building
          communication software for criminal courts to reduce pretrial detention times. We won $50,000 at Sparks Weekend and
          I've been building the core infrastructure from day one.
        </p>

        <p>
          Outside of work I'm competing in the <span className="text-accent">OpenAI Parameter Golf Challenge</span> — training a
          language model to fit within 16MB on 8 H100 GPUs. It's one of the most technically demanding things I've worked on
          and I'm learning a ton about model architecture, quantization, and training efficiency.
        </p>

        <p>
          When I'm not coding — you'll find me at the gym, watching Chelsea FC, rewatching Attack on Titan,
          or deep in a Far Cry 3 or Uncharted 4 session. I also lead Bible study and find that faith keeps me grounded
          through the chaos of building things.
        </p>

        <p>
          This blog is where I'll share what I'm learning — technical deep dives, career reflections, and whatever
          else feels worth writing about. If any of this resonates, feel free to reach out at{" "}
          <a href="mailto:bereket.lemma10@gmail.com" className="text-accent hover:underline">
            bereket.lemma10@gmail.com
          </a>.
        </p>

        <p className="font-mono text-xs text-muted-foreground/60 mt-4">
          — Bereket
        </p>

      </div>

    </main>
  )
}