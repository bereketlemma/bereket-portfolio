import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Github } from "lucide-react"
import { allProjects, getProjectBySlug } from "@/lib/projects"
import { notFound } from "next/navigation"

type ProjectDetailPageProps = {
  params: { slug: string }
}

function SectionList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded border border-border/40 p-6">
      <h2 className="font-syne text-lg font-semibold text-foreground">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
            <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export async function generateStaticParams() {
  return allProjects.map((project) => ({
    slug: project.slug,
  }))
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = params
  const project = getProjectBySlug(slug)

  if (!project) {
    return {
      title: "Project Not Found",
    }
  }

  return {
    title: `${project.shortTitle} | Engineering Case Study`,
    description: project.shortDescription,
  }
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = params
  const project = getProjectBySlug(slug)

  if (!project) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-24">
      <Link
        href="/projects"
        className="mb-10 inline-flex items-center gap-2 rounded border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:border-accent hover:text-accent transition-all"
      >
        <ArrowLeft size={14} />
        back to projects
      </Link>

      <div className="rounded border border-border/40 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-accent">Engineering Case Study</p>
            <h1 className="mt-2 font-syne text-2xl font-bold text-foreground">{project.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{project.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {project.live && (
              <Link
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded border border-border/60 px-2 py-1 font-mono text-xs text-muted-foreground hover:border-accent hover:text-accent transition-all"
              >
                <ExternalLink size={12} />
                live
              </Link>
            )}
            <Link
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded border border-border/60 px-2 py-1 font-mono text-xs text-muted-foreground hover:border-accent hover:text-accent transition-all"
            >
              <Github size={12} />
              github
            </Link>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-border/60 px-2 py-0.5 font-mono text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <section className="mt-6 rounded border border-border/40 p-6">
        <h2 className="font-syne text-lg font-semibold text-foreground">Problem and Goals</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{project.caseStudy.problem}</p>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <SectionList title="Constraints" items={project.caseStudy.constraints} />
        <SectionList title="Architecture and Stack Choices" items={project.caseStudy.architecture} />
        <SectionList title="Tradeoffs" items={project.caseStudy.tradeoffs} />
        <SectionList title="Decision Log" items={project.caseStudy.decisions} />
        <SectionList title="Results and Outcomes" items={project.caseStudy.outcomes} />
        <SectionList title="What I Would Improve Next" items={project.caseStudy.nextSteps} />
      </div>
    </main>
  )
}
