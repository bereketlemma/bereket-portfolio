"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import type { ArchitectureNode } from "@/lib/projects"

export function ArchitectureMap({ nodes }: { nodes: ArchitectureNode[] }) {
  const [selected, setSelected] = useState<number>(0)
  const selectedNode = nodes[selected]

  return (
    <section className="rounded-lg border border-border/35 bg-[#0E0E0E] p-4 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:overflow-hidden">
      <div className="shrink-0 border-b border-border/25 pb-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
          System Architecture
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(245px,0.74fr)_minmax(0,1.45fr)]">
        <div className="space-y-1.5 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
          {nodes.map((node, i) => {
            const isSelected = selected === i

            return (
              <div key={node.name} className="relative">
                <button
                  onClick={() => setSelected(i)}
                  className={`w-full rounded-md border bg-[#0A0A0A] px-3 py-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500/50 hover:bg-[#12110F] hover:shadow-[0_10px_22px_rgba(0,0,0,0.26)] ${
                    isSelected
                      ? "border-amber-500/75 bg-[#14120E] shadow-[0_0_0_1px_rgba(245,158,11,0.12)]"
                      : "border-border/35"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border font-mono text-[9px] ${
                        isSelected
                          ? "border-amber-500/70 bg-amber-500/[0.1] text-accent"
                          : "border-border/45 text-[#71717A]"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <p
                        className={`font-mono text-[12px] font-medium leading-4 ${
                          isSelected ? "text-[#F8FAFC]" : "text-[#E5E7EB]"
                        }`}
                      >
                        {node.name}
                      </p>
                      <p className="mt-1 text-[12px] leading-4 text-[#A1A1AA]">
                        {node.description}
                      </p>
                    </div>
                  </div>
                </button>

                {i < nodes.length - 1 && (
                  <div className="ml-[15px] h-1.5 w-px bg-border/45" />
                )}
              </div>
            )
          })}
        </div>

        <div className="lg:min-h-0 lg:self-start">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16 }}
              className="rounded-lg border border-border/35 bg-[#0A0A0A] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500/40 hover:bg-[#0D0D0D] hover:shadow-[0_14px_32px_rgba(0,0,0,0.32)] lg:max-h-full lg:overflow-y-auto"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#71717A]">
                Component Detail
              </p>
              <h3 className="mt-2 font-syne text-lg font-bold leading-tight text-[#F8FAFC]">
                {selectedNode.name}
              </h3>

              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#71717A]">
                    What it does
                  </p>
                  <p className="text-[14px] leading-6 text-[#E5E7EB]">
                    {selectedNode.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#71717A]">
                    Why I chose it
                  </p>
                  <p className="text-[14px] leading-6 text-[#E5E7EB]">
                    {selectedNode.why}
                  </p>
                </div>

                {selectedNode.tradeoff && (
                  <div className="space-y-2 border-l border-amber-500/35 bg-[#11100E] px-3.5 py-3">
                    <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent">
                      Tradeoff
                    </p>
                    <p className="text-[14px] leading-6 text-[#E5E7EB]">
                      {selectedNode.tradeoff}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
