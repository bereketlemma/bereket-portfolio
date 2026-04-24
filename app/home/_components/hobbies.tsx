"use client"

import Link from "next/link"
import { useInView } from "react-intersection-observer"
import { Dumbbell, Gamepad2, Coffee, Utensils } from "lucide-react"
import type { LucideIcon } from "lucide-react"

const hobbies: {
  icon: LucideIcon
  title: string
  description: string
  link: string | null
  linkLabel: string | null
}[] = [
  {
    icon: Dumbbell,
    title: "Sports",
    description:
      "I love sports and am a very active person. Down to play basketball, volleyball, pickleball, you name it. But soccer is what I mainly play and watch. Currently cutting and getting lean for the summer, and very excited for the World Cup this summer.",
    link: "https://hevy.com/user/bereket10",
    linkLabel: "follow me on Hevy →",
  },
  {
    icon: Gamepad2,
    title: "Gaming & Anime",
    description:
      "Far Cry 3 and Uncharted 4 are the games I always go back to. Attack on Titan got me into anime and I haven't found anything that hits the same way since. Vinland Saga comes close.",
    link: null,
    linkLabel: null,
  },
  {
    icon: Coffee,
    title: "Coffee",
    description:
      "Ethiopian coffee is a whole ritual back home. I grew up around it and still take it seriously.",
    link: null,
    linkLabel: null,
  },
  {
    icon: Utensils,
    title: "Cooking",
    description:
      "Started cooking my sophomore year of college when I moved off campus and just kept going with it. Love trying new recipes. If you've got ideas or recipes, send them my way.",
    link: null,
    linkLabel: null,
  },
]

function HobbyCard({ hobby, index }: { hobby: (typeof hobbies)[0]; index: number }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.08 })

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded border border-border/40 p-5 transition-all duration-500 ease-out
        hover:border-accent/50 hover:shadow-[0_0_20px_rgba(var(--accent-rgb,100,200,255),0.08)]
        ${inView ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-8 opacity-0"}
      `}
      style={{ transitionDelay: `${index * 70}ms` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="absolute left-0 top-0 h-px w-0 bg-accent/60 transition-all duration-500 group-hover:w-full" />

      <div className="relative mb-3 flex items-center gap-3">
        <hobby.icon className="h-5 w-5 text-accent transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 group-hover:drop-shadow-[0_0_8px_rgba(var(--accent-rgb,100,200,255),0.4)]" />
        <h3 className="font-syne text-sm font-bold text-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent">
          {hobby.title}
        </h3>
      </div>

      <p className="relative text-xs leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-muted-foreground/90">
        {hobby.description}
      </p>

      {hobby.link && (
        <Link
          href={hobby.link}
          target="_blank"
          rel="noopener noreferrer"
          className="relative mt-3 inline-block font-mono text-xs text-accent transition-all duration-300 hover:underline group-hover:translate-x-1"
        >
          {hobby.linkLabel}
        </Link>
      )}

      <div className="absolute bottom-0 right-0 h-px w-0 bg-accent/40 transition-all duration-500 delay-100 group-hover:w-full" />
    </div>
  )
}

export default function Hobbies() {
  const { ref: headerRef, inView: headerInView } = useInView({ triggerOnce: true, threshold: 0.25 })

  return (
    <section id="hobbies" className="py-24">
      <style>{`
        @keyframes lineGrow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>

      <div
        ref={headerRef}
        className={`mb-12 flex items-center gap-4 transition-all duration-500 ${
          headerInView ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
        }`}
      >
        <span className="font-mono text-sm text-accent">04.</span>
        <h2 className="font-syne text-2xl font-bold text-foreground">Beyond the Code</h2>
        <div
          className="h-px flex-1 bg-gradient-to-r from-accent/50 via-border to-transparent"
          style={{
            transformOrigin: "left",
            animation: headerInView ? "lineGrow 0.8s ease 0.3s both" : "none",
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {hobbies.map((hobby, i) => (
          <HobbyCard key={hobby.title} hobby={hobby} index={i} />
        ))}
      </div>
    </section>
  )
}