"use client"

import { useState, useEffect, useRef } from "react"

type FlowStage = {
  id: string
  title: string
  status: "completed" | "in-progress" | "pending"
  iconColor: "primary" | "secondary" | "muted" | "accent"
  description: string
}

function parseDescription(desc: string) {
  const lines = desc.split("\n")
  const plain = lines[0] || ""
  let technical = ""
  let tradeoff = ""

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].startsWith("Tradeoff: ")) {
      tradeoff = lines[i].replace("Tradeoff: ", "")
    } else if (lines[i] && lines[i] !== plain) {
      technical = lines[i]
    }
  }
  return { plain, technical, tradeoff }
}

type ProjectFlowProps = {
  stages: FlowStage[]
}

export function ProjectFlow({ stages }: ProjectFlowProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [visible, setVisible] = useState<Set<number>>(new Set())
  const [hintDismissed, setHintDismissed] = useState(false)
  const railRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSelected(null)
    setVisible(new Set())
    setHintDismissed(false)
    stages.forEach((_, i) => {
      setTimeout(() => {
        setVisible((prev) => new Set(prev).add(i))
      }, 200 + i * 120)
    })
  }, [stages])

  function handleSelect(i: number) {
    setSelected(selected === i ? null : i)
    if (!hintDismissed) setHintDismissed(true)
  }

  return (
    <div className="relative mt-8 sm:mt-10">
      <style>{`
        @keyframes particleFall {
          0% { top: -6px; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes nodeEnter {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes expandReveal {
          from { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; margin-top: 0; }
          to { opacity: 1; max-height: 400px; padding-top: 12px; padding-bottom: 12px; margin-top: 12px; }
        }
        @keyframes pulseRing {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes hintBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(3px); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 8px hsl(var(--accent) / 0.15); }
          50% { box-shadow: 0 0 20px hsl(var(--accent) / 0.3); }
        }
        .flow-card {
          transition: border-color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;
        }
        .flow-card:hover {
          border-color: hsl(var(--accent) / 0.25);
          background-color: hsl(var(--accent) / 0.02);
        }
        .flow-card.active {
          border-color: hsl(var(--accent) / 0.35);
          background-color: hsl(var(--accent) / 0.04);
          animation: glowPulse 3s ease-in-out infinite;
        }
      `}</style>

      {/* Hint */}
      {!hintDismissed && visible.has(0) && (
        <div
          className="mb-6 flex items-center gap-2 font-mono text-[11px] text-accent/50"
          style={{ animation: "nodeEnter 0.5s ease 1.5s both" }}
        >
          <span
            style={{ animation: "hintBounce 1.5s ease-in-out infinite" }}
          >
            ↓
          </span>
          <span>click any step to explore the details</span>
        </div>
      )}

      {/* Main flow container */}
      <div className="relative" ref={railRef}>
        {/* Vertical rail */}
        <div
          className="absolute left-[19px] top-0 bottom-0 w-px sm:left-[23px]"
          style={{
            background: "linear-gradient(180deg, hsl(var(--accent) / 0.3) 0%, hsl(var(--accent) / 0.08) 100%)",
          }}
        >
          {/* Animated particles */}
          {[0, 1, 2].map((p) => (
            <div
              key={p}
              className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full"
              style={{
                background: "hsl(var(--accent) / 0.7)",
                boxShadow: "0 0 8px hsl(var(--accent) / 0.4)",
                animation: `particleFall ${4 + p * 0.5}s linear infinite`,
                animationDelay: `${p * 1.3}s`,
              }}
            />
          ))}
        </div>

        {/* Steps */}
        <div className="relative flex flex-col gap-0">
          {stages.map((stage, i) => {
            const parsed = parseDescription(stage.description)
            const isActive = selected === i
            const isVisible = visible.has(i)
            const isLast = i === stages.length - 1

            return (
              <div key={stage.id} className="relative">
                {/* Step row */}
                <div
                  className="relative flex items-start gap-4 sm:gap-5"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateX(0)" : "translateX(-20px)",
                    transition: `opacity 0.5s ease, transform 0.5s ease`,
                  }}
                >
                  {/* Node circle on rail */}
                  <div className="relative z-10 flex-shrink-0">
                    <button
                      onClick={() => handleSelect(i)}
                      className={`
                        relative flex h-10 w-10 items-center justify-center rounded-full
                        border-2 font-mono text-[11px] font-bold
                        transition-all duration-300 sm:h-12 sm:w-12 sm:text-xs
                        ${isActive
                          ? "border-accent bg-accent/15 text-accent shadow-[0_0_16px_hsl(var(--accent)/0.25)]"
                          : "border-border/50 bg-background text-muted-foreground hover:border-accent/40 hover:text-accent/70"
                        }
                      `}
                    >
                      {String(i + 1).padStart(2, "0")}

                      {/* Pulse ring on active */}
                      {isActive && (
                        <span
                          className="absolute inset-0 rounded-full border-2 border-accent"
                          style={{ animation: "pulseRing 2s ease-out infinite" }}
                        />
                      )}
                    </button>
                  </div>

                  {/* Card */}
                  <div
                    className={`flow-card min-w-0 flex-1 cursor-pointer rounded-lg border px-4 py-3.5 sm:px-5 sm:py-4 ${isActive ? "active" : ""}`}
                    onClick={() => handleSelect(i)}
                    style={{ borderColor: "hsl(var(--border) / 0.3)" }}
                  >
                    {/* Preview line */}
                    <div className="flex items-start gap-2">
                      <p
                        className={`
                          flex-1 text-[13px] leading-relaxed transition-colors duration-300
                          ${isActive ? "text-foreground" : "text-foreground/60"}
                        `}
                      >
                        {parsed.plain}
                      </p>

                      {/* Chevron */}
                      <div
                        className={`
                          mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded
                          transition-all duration-300
                          ${isActive
                            ? "bg-accent/10 text-accent"
                            : "text-muted-foreground/30"
                          }
                        `}
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                          style={{
                            transform: isActive ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.3s ease",
                          }}
                        >
                          <path
                            d="M2 3.5L5 6.5L8 3.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Expanded content */}
                    {isActive && (parsed.technical || parsed.tradeoff) && (
                      <div
                        className="overflow-hidden border-t border-border/15"
                        style={{ animation: "expandReveal 0.35s ease forwards" }}
                      >
                        {parsed.technical && (
                          <p className="text-xs leading-6 text-muted-foreground">
                            {parsed.technical}
                          </p>
                        )}

                        {parsed.tradeoff && (
                          <div className="mt-3 flex gap-3 rounded-md border border-accent/15 bg-accent/[0.03] px-3.5 py-2.5">
                            <div className="flex-shrink-0">
                              <span className="inline-block rounded border border-accent/25 bg-accent/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-accent">
                                why
                              </span>
                            </div>
                            <p className="text-xs leading-6 text-foreground/65">
                              {parsed.tradeoff}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Segment connector */}
                {!isLast && (
                  <div
                    className="relative ml-[19px] h-6 w-px sm:ml-[23px] sm:h-8"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transition: "opacity 0.4s ease 0.2s",
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Terminal dot at end */}
        {visible.has(stages.length - 1) && (
          <div
            className="relative ml-[15px] mt-2 flex h-[10px] w-[10px] items-center justify-center rounded-full sm:ml-[19px]"
            style={{
              background: "hsl(var(--accent) / 0.3)",
              boxShadow: "0 0 10px hsl(var(--accent) / 0.2)",
              animation: "nodeEnter 0.5s ease both",
              animationDelay: `${stages.length * 0.12 + 0.3}s`,
            }}
          >
            <div
              className="h-[4px] w-[4px] rounded-full"
              style={{ background: "hsl(var(--accent) / 0.8)" }}
            />
          </div>
        )}
      </div>
    </div>
  )
}