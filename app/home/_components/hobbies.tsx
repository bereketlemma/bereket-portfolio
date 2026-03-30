"use client"

import Link from "next/link"
import { useInView } from "react-intersection-observer"
import { Dumbbell, Swords, Gamepad2, Church, Coffee, Utensils } from "lucide-react"
import type { LucideIcon } from "lucide-react"

// Custom soccer ball icon (Lucide doesn't have one)
function SoccerBall({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20M2 12h20" />
    </svg>
  )
}

const hobbies: {
  icon: LucideIcon | typeof SoccerBall
  title: string
  description: string
  link: string | null
  linkLabel: string | null
}[] = [
  {
    icon: Dumbbell,
    title: "Lifting & Soccer",
    description:
      "Lifting is my main fitness focus. I enjoy the process of getting stronger and the mental clarity it brings. Soccer is my favorite sport to play and watch. I grew up playing and am a lifelong fan of the game.",
    link: "https://hevy.com/user/bereket10",
    linkLabel: "Follow me on Hevy →",
  },
  {
    icon: Gamepad2,
    title: "Gaming & Anime",
    description:
      "I am a casual gamer but enjoy immersing myself in a good story game or anime. Games like resident evil and uncharted 4 are some of my favorites. I also enjoy anime like attack on titan and vinland saga. Any recommendations are welcome!",
    link: null,
    linkLabel: null,
  },
  {
    icon: Coffee,
    title: "Coffee & Spiritual Life",
    description: "As Ethiopian I grew up around coffee culture and I love trying new roasts and brewing methods. I am also working on my spiritual life and enjoy reading the Bible.",
    linkLabel: null,
    link: null
  },
  {
    icon: Utensils,
    title: "Cooking",
    description:
      "I enjoy cooking and trying new recipes. I find it to be a creative outlet to experiment with flavors and cuisines. Let me know if you have any favorite recipes to share!",
    link: null,
    linkLabel: null,
  },
]

function HobbyCard({ hobby, index }: { hobby: typeof hobbies[0]; index: number }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 })

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded border border-border/40 p-5 transition-all duration-700 ease-out
        hover:border-accent/50 hover:shadow-[0_0_20px_rgba(var(--accent-rgb,100,200,255),0.08)]
        ${inView ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95"}
      `}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Hover glow gradient */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-accent/5 via-transparent to-accent/5" />

      {/* Top accent line that slides in */}
      <div className="absolute top-0 left-0 h-px w-0 bg-accent/60 group-hover:w-full transition-all duration-500" />

      {/* Icon + title */}
      <div className="relative mb-3 flex items-center gap-3">
        <hobby.icon className="h-5 w-5 text-accent transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 group-hover:drop-shadow-[0_0_8px_rgba(var(--accent-rgb,100,200,255),0.4)]" />
        <h3 className="font-syne text-sm font-bold text-foreground group-hover:text-accent transition-colors duration-300 group-hover:translate-x-1">
          {hobby.title}
        </h3>
      </div>

      {/* Description */}
      <p className="relative text-xs leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-muted-foreground/90">
        {hobby.description}
      </p>

      {/* Optional link */}
      {hobby.link && (
        <Link
          href={hobby.link}
          target="_blank"
          rel="noopener noreferrer"
          className="relative mt-3 inline-block font-mono text-xs text-accent hover:underline transition-all duration-300 group-hover:translate-x-1"
        >
          {hobby.linkLabel}
        </Link>
      )}

      {/* Bottom accent line that slides in from right */}
      <div className="absolute bottom-0 right-0 h-px w-0 bg-accent/40 group-hover:w-full transition-all duration-500 delay-100" />
    </div>
  )
}

export default function Hobbies() {
  const { ref: headerRef, inView: headerInView } = useInView({ triggerOnce: true, threshold: 0.5 })

  return (
    <section id="hobbies" className="py-24">

      {/* Section header */}
      <div
        ref={headerRef}
        className={`mb-12 flex items-center gap-4 transition-all duration-700 ${
          headerInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
        }`}
      >
        <span className="font-mono text-sm text-accent">04.</span>
        <h2 className="font-syne text-2xl font-bold text-foreground">Beyond the Code</h2>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {hobbies.map((hobby, i) => (
          <HobbyCard key={i} hobby={hobby} index={i} />
        ))}
      </div>

    </section>
  )
}
