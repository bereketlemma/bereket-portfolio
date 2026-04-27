"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

export type FlowStage = {
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
  const [selected, setSelected] = useState<number | null>(0)

  function handleSelect(i: number) {
    setSelected(selected === i ? null : i)
  }

  return (
    <div className="mt-7 space-y-2 pl-5 pr-1">
      {stages.map((stage, i) => {
        const parsed = parseDescription(stage.description)
        const isActive = selected === i
        const isLast = i === stages.length - 1

        return (
          <div key={stage.id} className="relative">
            {!isLast && (
              <div className="absolute left-[15px] top-9 h-[calc(100%+0.5rem)] w-px bg-border/40" />
            )}

            <div className="relative flex gap-3">
              <button
                onClick={() => handleSelect(i)}
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded border bg-[#0A0A0A] font-mono text-[10px] font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
                  isActive
                    ? "border-amber-500/80 bg-amber-500/[0.12] text-accent shadow-[0_0_0_1px_rgba(245,158,11,0.18)]"
                    : "border-border/45 text-[#A1A1AA] hover:border-amber-500/55 hover:bg-[#12110F] hover:text-[#E5E7EB]"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </button>

              <button
                onClick={() => handleSelect(i)}
                className={`min-w-0 flex-1 rounded-md border bg-[#0A0A0A] text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500/50 hover:bg-[#12110F] ${
                  isActive
                    ? "border-amber-500/55 bg-[#14120E] px-4 py-3 shadow-[0_12px_26px_rgba(0,0,0,0.28)]"
                    : "border-border/35 px-3.5 py-2.5"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <p className={`${isActive ? "leading-6" : "leading-5"} text-[13px] text-[#E5E7EB]`}>
                    {parsed.plain}
                  </p>
                  <ChevronDown
                    size={14}
                    className={`mt-1 shrink-0 text-[#71717A] transition-all duration-200 ${
                      isActive ? "rotate-180 text-accent" : ""
                    }`}
                  />
                </div>

                {isActive && (parsed.technical || parsed.tradeoff) && (
                  <div className="mt-3 grid gap-3 border-t border-border/25 pt-3 xl:grid-cols-2">
                    {parsed.technical && (
                      <p className="text-[13px] leading-6 text-[#A1A1AA]">
                        {parsed.technical}
                      </p>
                    )}

                    {parsed.tradeoff && (
                      <div className="border-l border-amber-500/30 bg-[#0E0E0E] px-3.5 py-3">
                        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                          Tradeoff
                        </p>
                        <p className="text-[13px] leading-6 text-[#E5E7EB]">
                          {parsed.tradeoff}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
