"use client"

import { useInView } from "react-intersection-observer"

const experiences = [
  {
    date: "Mar 2026 — Present",
    role: "Parameter Golf Competitor",
    company: "OpenAI",
    location: "Remote",
    description:
      "Training a language model to fit within 16MB, under 10 minutes on 8 H100 GPUs, optimized for maximum compression on FineWeb. Engineering custom training loops with gradient accumulation, mixed-precision arithmetic, and memory-efficient data loading.",
    tags: ["Python", "PyTorch", "LLM", "Quantization", "H100"],
  },
  {
    date: "Nov 2024 — Jan 2025",
    role: "Startup Engineer (Founding Team)",
    company: "Celeri.io",
    location: "Spokane, WA",
    description:
      "Won $50,000 investment at Sparks Weekend to build communication software for criminal courts, reducing pretrial detention times by connecting stakeholders across counties.",
    tags: ["Pitch Deck", "Prototyping", "Team communication", "Product Design", "Legal-Tech"],
    link: "https://www.youtube.com/watch?v=CvY1y46ypYw",
    linkLabel: "Watch the pitch →",
  },
    {
    date: "Feb 2025 — May 2025",
    role: "Full-Stack Software Engineer Intern",
    company: "Hewitt Learning",
    location: "Remote",
    description:
      "Designed scalable REST APIs with C#, ASP.NET Core, and MySQL with RBAC. Automated PDF report generation reducing turnaround by 60%. Deployed via GitHub Actions CI/CD.",
    tags: ["C#", "ASP.NET Core", "MySQL", "REST APIs", "CI/CD"],
  },
  {
    date: "May 2024 — Aug 2024",
    role: "Security Engineer Intern",
    company: "Washington Trust Bank",
    location: "Spokane, WA",
    description:
      "Automated IT and vulnerability monitoring workflows using PowerShell and Python REST APIs, eliminating 80+ engineering hours/week. Deployed 5+ automated security compliance checks integrated with Azure and GitHub Actions CI/CD.",
    tags: ["Python", "PowerShell", "Azure", "GitHub Actions", "Security"],
  },
  {
    date: "Jan 2023 — May 2023",
    role: "Volunteer Software Engineer",
    company: "West Central Community Center",
    location: "Spokane, WA",
    description:
      "Built a full-stack database management system for a nonprofit, migrating 1000+ user records from manual Excel spreadsheets to a relational MySQL database. Led a 4-member team delivering role-based authentication, full CRUD operations, and sortable views.",
    tags: ["React", "Node.js", "MySQL", "Express.js", "Heroku", "Netlify"],
    link: null,
    linkLabel: null,
  },
]

function ExperienceCard({ exp, index }: { exp: typeof experiences[0]; index: number }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.08 })

  return (
    <div
      ref={ref}
      className={`group grid grid-cols-1 gap-2 md:grid-cols-[200px_1fr] md:gap-8 transition-all duration-500 ease-out
        ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
      `}
      style={{ transitionDelay: `${index * 70}ms` }}
    >
      <div className="flex flex-col">
        <span className="font-mono text-xs text-accent">{exp.date}</span>
        <span className="mt-1 font-mono text-xs text-muted-foreground">{exp.location}</span>
      </div>

      <div className="relative overflow-hidden rounded border border-border/40 p-5 transition-all duration-300
        group-hover:border-accent/50 group-hover:shadow-[0_0_20px_rgba(var(--accent-rgb,100,200,255),0.08)]">

        {/* Hover glow gradient */}
        <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-accent/5 via-transparent to-accent/5" />

        {/* Top accent line */}
        <div className="absolute top-0 left-0 h-px w-0 bg-accent/60 group-hover:w-full transition-all duration-500" />

        <h3 className="relative font-syne text-base font-bold text-foreground group-hover:text-accent transition-all duration-300 group-hover:translate-x-1">{exp.role}</h3>
        <p className="relative mt-0.5 font-mono text-sm text-accent">{exp.company}</p>
        <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">{exp.description}</p>
        {exp.link && (
          <a
            href={exp.link}
            target="_blank"
            rel="noopener noreferrer"
            className="relative mt-2 inline-block font-mono text-xs text-accent hover:underline transition-all duration-300 group-hover:translate-x-1"
          >
            {exp.linkLabel}
          </a>
        )}
        <div className="relative mt-4 flex flex-wrap gap-2">
          {exp.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-border/60 px-2 py-0.5 font-mono text-xs text-muted-foreground hover:border-accent/50 hover:text-accent transition-all duration-300 cursor-default"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 right-0 h-px w-0 bg-accent/40 group-hover:w-full transition-all duration-500 delay-100" />
      </div>
    </div>
  )
}

export default function Experience() {
  const { ref: headerRef, inView: headerInView } = useInView({ triggerOnce: true, threshold: 0.25 })

  return (
    <section id="experience" className="pt-12 pb-24">
      <div
        ref={headerRef}
        className={`mb-12 flex items-center gap-4 transition-all duration-500 ${
          headerInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
        }`}
      >
        <span className="font-mono text-sm text-accent">02.</span>
        <h2 className="font-syne text-2xl font-bold text-foreground">Experience</h2>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-col gap-10">
        {experiences.map((exp, i) => (
          <ExperienceCard key={i} exp={exp} index={i} />
        ))}
      </div>
    </section>
  )
}