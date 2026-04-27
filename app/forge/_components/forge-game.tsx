"use client"

import { useState, useMemo, useCallback } from "react"
import {
  ZONES,
  COMPONENTS,
  SCORE_LABELS,
  computeSystemScores,
  computeWeightedTotal,
  getComponentById,
  getRandomRun,
  getWarnings,
  getSynergies,
  type Challenge,
  type Constraint,
  type ScoreDimension,
  type ComponentTag,
} from "../_data"

// ─── Types ────────────────────────────────────────────────────────────────────

type GamePhase = "start" | "building" | "complete"

type RunState = {
  challenge: Challenge
  constraints: Constraint[]
  placed: Record<string, string[]>
  activeZoneId: string | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTY_STYLE: Record<string, string> = {
  MEDIUM: "text-amber-400 border-amber-400/25 bg-amber-400/5",
  HARD: "text-orange-400 border-orange-400/25 bg-orange-400/5",
  EXPERT: "text-red-400 border-red-400/25 bg-red-400/5",
}

const TAG_STYLE: Record<ComponentTag, string> = {
  recommended: "text-emerald-400 border-emerald-400/25 bg-emerald-400/5",
  risky: "text-red-400 border-red-400/25 bg-red-400/5",
  expensive: "text-amber-400 border-amber-400/25 bg-amber-400/5",
  complex: "text-orange-400 border-orange-400/25 bg-orange-400/5",
  managed: "text-blue-400 border-blue-400/25 bg-blue-400/5",
}

const SEVERITY_STYLE = {
  critical: "border-red-500/20 bg-red-500/5 text-red-300",
  warning: "border-amber-500/20 bg-amber-500/5 text-amber-300",
  info: "border-blue-500/20 bg-blue-500/5 text-blue-300",
}

const SEVERITY_DOT = {
  critical: "bg-red-400",
  warning: "bg-amber-400",
  info: "bg-blue-400",
}

// ─── Utility components ───────────────────────────────────────────────────────

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round((value / 10) * 100)
  const color = value >= 7.5 ? "bg-accent" : value >= 5 ? "bg-amber-500" : "bg-red-500"
  return (
    <div className="flex items-center gap-3">
      <span className="w-[4.5rem] font-mono text-[10px] text-muted-foreground shrink-0 leading-none">
        {label}
      </span>
      <div className="flex-1 h-1 rounded-full bg-border/40 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-5 font-mono text-[10px] text-right text-foreground/60 shrink-0">
        {value.toFixed(0)}
      </span>
    </div>
  )
}

function ConstraintBadge({ label }: { label: string }) {
  return (
    <span className="inline-block rounded border border-accent/20 bg-accent/5 px-2 py-0.5 font-mono text-[10px] text-accent/80">
      {label}
    </span>
  )
}

function TagBadge({ tag }: { tag: ComponentTag }) {
  return (
    <span className={`rounded border px-1.5 py-0.5 font-mono text-[9px] tracking-wider uppercase ${TAG_STYLE[tag]}`}>
      {tag}
    </span>
  )
}

function FlowArrow() {
  return (
    <div className="flex justify-center items-center py-0.5 pointer-events-none">
      <div className="flex flex-col items-center gap-0">
        <div className="w-px h-3 bg-border/30" />
        <div className="text-border/30 text-[10px] leading-none">▼</div>
      </div>
    </div>
  )
}

function scoreTier(score: number): { label: string; color: string } {
  if (score >= 85) return { label: "EXCEPTIONAL", color: "text-emerald-400" }
  if (score >= 70) return { label: "PRODUCTION-READY", color: "text-accent" }
  if (score >= 55) return { label: "FUNCTIONAL", color: "text-amber-400" }
  if (score >= 40) return { label: "UNSTABLE", color: "text-orange-400" }
  return { label: "CRITICAL RISKS", color: "text-red-400" }
}

// ─── START SCREEN ─────────────────────────────────────────────────────────────

function StartScreen({
  challenge,
  constraints,
  onStart,
}: {
  challenge: Challenge
  constraints: Constraint[]
  onStart: () => void
}) {
  return (
    <div className="mx-auto max-w-xl pt-6 pb-16">
      <div className="mb-8 text-center">
        <p className="font-mono text-[10px] tracking-[0.3em] text-accent/70 mb-3">
          FORGE — SYSTEM DESIGN SIMULATOR
        </p>
        <h1 className="font-mono text-2xl font-bold text-foreground mb-3 leading-snug">
          Build the System.
          <br />
          Make the Call.
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Choose your architecture stack under real production constraints. Every run is different.
        </p>
      </div>

      <div className="rounded-lg border border-border/50 bg-surface/60 p-5 mb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">NEXT CHALLENGE</p>
          <span className={`font-mono text-[9px] tracking-wider rounded border px-2 py-0.5 ${DIFFICULTY_STYLE[challenge.difficulty]}`}>
            {challenge.difficulty}
          </span>
        </div>
        <h2 className="font-mono text-base font-semibold text-foreground mb-2">
          {challenge.title}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {challenge.description}
        </p>
        <div>
          <p className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground mb-2">
            ACTIVE CONSTRAINTS
          </p>
          <div className="flex flex-wrap gap-1.5">
            {constraints.map((c) => (
              <ConstraintBadge key={c.id} label={c.label} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-7">
        {[
          { step: "01", label: "PLACE COMPONENTS", desc: "Build the architecture zone by zone" },
          { step: "02", label: "WATCH SCORES", desc: "Live tradeoff engine updates as you build" },
          { step: "03", label: "SEE MY VERSION", desc: "Compare your stack to mine with reasoning" },
        ].map(({ step, label, desc }) => (
          <div key={step} className="rounded border border-border/30 bg-surface/30 p-3">
            <p className="font-mono text-[9px] text-accent/60 mb-1">{step}</p>
            <p className="font-mono text-[10px] text-foreground/80 font-medium mb-1">{label}</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={onStart}
          className="font-mono text-sm tracking-[0.2em] px-10 py-3.5 border border-accent text-accent hover:bg-accent hover:text-background transition-all duration-200 rounded"
        >
          START CHALLENGE →
        </button>
      </div>
    </div>
  )
}

// ─── COMPONENT LIBRARY (LEFT PANEL) ──────────────────────────────────────────

const LIBRARY_GROUPS = [
  { label: "Traffic & Edge", categoryMatch: "Traffic & Edge" },
  { label: "Application Layer", categoryMatch: "Application Layer" },
  { label: "Databases", categoryMatch: "Databases" },
  { label: "Cache & Storage", categoryMatchFn: (cat: string) => cat === "Cache" || cat === "Storage" },
  { label: "Async Processing", categoryMatch: "Async Processing" },
  { label: "Authentication", categoryMatch: "Authentication" },
  { label: "Secrets", categoryMatch: "Secrets" },
  { label: "Observability", categoryMatch: "Observability" },
] as const

function ComponentLibrary({
  placed,
  activeZoneId,
  onToggle,
  onActivateZone,
}: {
  placed: Record<string, string[]>
  activeZoneId: string | null
  onToggle: (compId: string) => void
  onActivateZone: (zoneId: string | null) => void
}) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>("Traffic & Edge")
  const allPlaced = new Set(Object.values(placed).flat())

  // When a zone is active, auto-expand its relevant group
  const activeZone = activeZoneId ? ZONES.find((z) => z.id === activeZoneId) : null

  const getGroupComponents = (group: (typeof LIBRARY_GROUPS)[number]) => {
    if ("categoryMatchFn" in group) {
      return COMPONENTS.filter((c) => group.categoryMatchFn(c.category))
    }
    return COMPONENTS.filter((c) => c.category === group.categoryMatch)
  }

  const isCompatibleWithActiveZone = (compId: string) => {
    if (!activeZoneId) return true
    const comp = COMPONENTS.find((c) => c.id === compId)
    return comp?.zoneId === activeZoneId
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-2 px-0.5">
        <p className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">COMPONENT LIBRARY</p>
        {activeZone && (
          <button
            onClick={() => onActivateZone(null)}
            className="font-mono text-[9px] text-accent/70 hover:text-accent transition-colors"
          >
            CLEAR FILTER ×
          </button>
        )}
      </div>

      {activeZone && (
        <div className="mb-2 rounded border border-accent/20 bg-accent/5 px-3 py-2 font-mono text-[10px] text-accent/80">
          Showing components for {activeZone.label}
        </div>
      )}

      <div className="flex-1 overflow-y-auto flex flex-col gap-px">
        {LIBRARY_GROUPS.map((group) => {
          const groupComps = getGroupComponents(group)
          if (groupComps.length === 0) return null
          const isExpanded = expandedGroup === group.label

          // Auto-expand groups with active zone components
          const hasActiveComp = activeZoneId
            ? groupComps.some((c) => c.zoneId === activeZoneId)
            : false

          return (
            <div key={group.label} className="rounded border border-border/25 overflow-hidden">
              <button
                onClick={() => setExpandedGroup(isExpanded ? null : group.label)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors ${
                  isExpanded ? "bg-surface/70" : "hover:bg-surface/40"
                } ${hasActiveComp ? "border-b border-accent/15" : ""}`}
              >
                <span className="font-mono text-[10px] text-foreground/70">{group.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] text-muted-foreground">
                    {groupComps.filter((c) => allPlaced.has(c.id)).length}/{groupComps.length}
                  </span>
                  <span className="font-mono text-[9px] text-muted-foreground">
                    {isExpanded ? "−" : "+"}
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="flex flex-col gap-px bg-surface/20 p-1">
                  {groupComps.map((comp) => {
                    const isPlaced = allPlaced.has(comp.id)
                    const placedIn = Object.entries(placed).find(([, ids]) => ids.includes(comp.id))?.[0]
                    const compatible = isCompatibleWithActiveZone(comp.id)
                    const zone = ZONES.find((z) => z.id === comp.zoneId)
                    const isFull = placed[comp.zoneId] && placed[comp.zoneId].length >= (zone?.maxSlots ?? 99)

                    return (
                      <button
                        key={comp.id}
                        onClick={() => onToggle(comp.id)}
                        disabled={!isPlaced && isFull}
                        className={`w-full text-left rounded p-2.5 transition-all border ${
                          isPlaced
                            ? "border-accent/30 bg-accent/8"
                            : compatible
                            ? "border-transparent hover:border-border/50 hover:bg-surface/60"
                            : "border-transparent opacity-30"
                        } ${isFull && !isPlaced ? "cursor-not-allowed opacity-40" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className={`font-mono text-[11px] font-medium leading-tight ${isPlaced ? "text-accent" : "text-foreground/80"}`}>
                            {comp.name}
                          </span>
                          <div className="flex items-center gap-1 shrink-0 mt-0.5">
                            {isPlaced && (
                              <span className="font-mono text-[9px] text-accent">✓</span>
                            )}
                            {comp.tags.slice(0, 1).map((tag) => (
                              <TagBadge key={tag} tag={tag} />
                            ))}
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed mb-1.5">
                          {comp.description}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 italic leading-relaxed">
                          ↳ {comp.tradeoffNote}
                        </p>
                        {isPlaced && placedIn && (
                          <p className="mt-1.5 font-mono text-[9px] text-accent/60">
                            placed in {ZONES.find((z) => z.id === placedIn)?.label}
                          </p>
                        )}
                        {isFull && !isPlaced && (
                          <p className="mt-1 font-mono text-[9px] text-muted-foreground/50">
                            zone full ({zone?.maxSlots} max)
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── ARCHITECTURE CANVAS (CENTER PANEL) ───────────────────────────────────────

function ComponentChip({
  id,
  onRemove,
}: {
  id: string
  onRemove: (id: string) => void
}) {
  const comp = getComponentById(id)
  if (!comp) return null
  return (
    <div className="flex items-center gap-1.5 rounded border border-accent/25 bg-accent/8 px-2 py-1 group">
      <span className="font-mono text-[10px] text-accent/90 leading-none">{comp.name}</span>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove(id)
        }}
        className="text-accent/40 hover:text-accent transition-colors font-mono text-[9px] leading-none"
        aria-label={`Remove ${comp.name}`}
      >
        ×
      </button>
    </div>
  )
}

function ZoneCard({
  zoneId,
  placed,
  isActive,
  onActivate,
  onRemove,
}: {
  zoneId: string
  placed: string[]
  isActive: boolean
  onActivate: () => void
  onRemove: (id: string) => void
}) {
  const zone = ZONES.find((z) => z.id === zoneId)
  if (!zone) return null
  const isEmpty = placed.length === 0

  return (
    <div
      className={`rounded-lg border transition-all duration-200 ${
        isActive
          ? "border-accent/40 bg-accent/5"
          : isEmpty && zone.required
          ? "border-dashed border-border/40 bg-surface/20"
          : placed.length > 0
          ? "border-border/40 bg-surface/40"
          : "border-dashed border-border/25 bg-surface/10"
      }`}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/20">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-semibold text-foreground/80 leading-none">
              {zone.label}
            </span>
            {zone.required && isEmpty && (
              <span className="font-mono text-[8px] text-red-400/70 border border-red-400/20 px-1 rounded">
                REQUIRED
              </span>
            )}
          </div>
          <p className="font-mono text-[9px] text-muted-foreground mt-0.5 leading-none">
            {zone.sublabel}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className="font-mono text-[9px] text-muted-foreground">
            {placed.length}/{zone.maxSlots}
          </span>
          <button
            onClick={onActivate}
            className={`font-mono text-[9px] px-2 py-1 rounded border transition-colors ${
              isActive
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-border/30 text-muted-foreground hover:border-accent/30 hover:text-accent"
            }`}
          >
            {isActive ? "ACTIVE" : "+ ADD"}
          </button>
        </div>
      </div>
      <div className="px-3 py-2.5 min-h-[2.5rem]">
        {isEmpty ? (
          <p className="font-mono text-[9px] text-muted-foreground/40 italic">
            {zone.required ? "Click + ADD to select components" : "Optional — skip if not needed"}
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {placed.map((id) => (
              <ComponentChip key={id} id={id} onRemove={onRemove} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ArchitectureCanvas({
  challenge,
  constraints,
  placed,
  activeZoneId,
  onActivateZone,
  onRemove,
  onSubmit,
}: {
  challenge: Challenge
  constraints: Constraint[]
  placed: Record<string, string[]>
  activeZoneId: string | null
  onActivateZone: (id: string | null) => void
  onRemove: (id: string) => void
  onSubmit: () => void
}) {
  const totalPlaced = Object.values(placed).flat().length
  const requiredFilled = ZONES.filter((z) => z.required).every(
    (z) => placed[z.id] && placed[z.id].length > 0
  )

  return (
    <div className="flex flex-col gap-2.5 h-full overflow-y-auto">
      {/* Challenge header */}
      <div className="rounded-lg border border-border/30 bg-surface/30 px-4 py-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">CHALLENGE</p>
          <span className={`font-mono text-[9px] rounded border px-2 py-0.5 shrink-0 ${DIFFICULTY_STYLE[challenge.difficulty]}`}>
            {challenge.difficulty}
          </span>
        </div>
        <p className="font-mono text-sm font-semibold text-foreground mb-1.5 leading-snug">
          {challenge.title}
        </p>
        <p className="text-[11px] text-muted-foreground leading-relaxed mb-2.5">
          {challenge.description}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {constraints.map((c) => (
            <ConstraintBadge key={c.id} label={c.label} />
          ))}
        </div>
      </div>

      {/* Architecture flow */}
      <div className="flex justify-center py-0.5">
        <div className="rounded-full border border-border/30 bg-surface/40 px-4 py-1 font-mono text-[10px] text-muted-foreground">
          USERS
        </div>
      </div>

      <FlowArrow />

      <ZoneCard
        zoneId="traffic"
        placed={placed.traffic ?? []}
        isActive={activeZoneId === "traffic"}
        onActivate={() => onActivateZone(activeZoneId === "traffic" ? null : "traffic")}
        onRemove={onRemove}
      />

      <FlowArrow />

      <ZoneCard
        zoneId="compute"
        placed={placed.compute ?? []}
        isActive={activeZoneId === "compute"}
        onActivate={() => onActivateZone(activeZoneId === "compute" ? null : "compute")}
        onRemove={onRemove}
      />

      <FlowArrow />

      <div className="grid grid-cols-2 gap-2">
        <ZoneCard
          zoneId="data"
          placed={placed.data ?? []}
          isActive={activeZoneId === "data"}
          onActivate={() => onActivateZone(activeZoneId === "data" ? null : "data")}
          onRemove={onRemove}
        />
        <ZoneCard
          zoneId="async"
          placed={placed.async ?? []}
          isActive={activeZoneId === "async"}
          onActivate={() => onActivateZone(activeZoneId === "async" ? null : "async")}
          onRemove={onRemove}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ZoneCard
          zoneId="security"
          placed={placed.security ?? []}
          isActive={activeZoneId === "security"}
          onActivate={() => onActivateZone(activeZoneId === "security" ? null : "security")}
          onRemove={onRemove}
        />
        <ZoneCard
          zoneId="observability"
          placed={placed.observability ?? []}
          isActive={activeZoneId === "observability"}
          onActivate={() => onActivateZone(activeZoneId === "observability" ? null : "observability")}
          onRemove={onRemove}
        />
      </div>

      {/* Submit */}
      <div className="mt-1 border-t border-border/20 pt-3 flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="h-0.5 rounded-full bg-border/30 overflow-hidden mb-1.5">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${Math.min(100, (totalPlaced / 10) * 100)}%` }}
            />
          </div>
          <p className="font-mono text-[10px] text-muted-foreground">
            {totalPlaced} components placed
            {!requiredFilled && " · fill required zones to submit"}
          </p>
        </div>
        <button
          onClick={onSubmit}
          disabled={!requiredFilled}
          className={`font-mono text-[11px] tracking-widest px-5 py-2.5 rounded border transition-all duration-200 shrink-0 ${
            requiredFilled
              ? "border-accent text-accent hover:bg-accent hover:text-background"
              : "border-border/30 text-border cursor-not-allowed"
          }`}
        >
          SUBMIT →
        </button>
      </div>
    </div>
  )
}

// ─── TRADEOFF ENGINE (RIGHT PANEL) ────────────────────────────────────────────

function TradeoffEngine({
  scores,
  total,
  warnings,
  synergies,
  constraints,
  placed,
}: {
  scores: ScoreDimension
  total: number
  warnings: ReturnType<typeof getWarnings>
  synergies: string[]
  constraints: Constraint[]
  placed: Record<string, string[]>
}) {
  const dims = Object.keys(SCORE_LABELS) as (keyof ScoreDimension)[]
  const { label, color } = scoreTier(total)
  const hasAnything = Object.values(placed).flat().length > 0

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground mb-3">
          TRADEOFF ENGINE
        </p>
        {!hasAnything ? (
          <p className="font-mono text-[11px] text-muted-foreground/50 leading-relaxed">
            Add components to see live analysis.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {dims.map((dim) => (
              <ScoreBar key={dim} label={SCORE_LABELS[dim]} value={scores[dim]} />
            ))}
          </div>
        )}
      </div>

      {hasAnything && (
        <div className="rounded border border-border/30 bg-surface/30 p-3 text-center">
          <p className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground mb-1.5">
            SYSTEM SCORE
          </p>
          <div className="font-mono text-4xl font-bold text-foreground leading-none mb-0.5">
            {total}
            <span className="text-muted-foreground text-sm font-normal">/100</span>
          </div>
          <p className={`font-mono text-[10px] tracking-widest mt-1 ${color}`}>{label}</p>
        </div>
      )}

      {warnings.length > 0 && (
        <div>
          <p className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground mb-2">
            WARNINGS
          </p>
          <div className="flex flex-col gap-1.5">
            {warnings.slice(0, 5).map((w, i) => (
              <div
                key={i}
                className={`flex gap-2 rounded border p-2.5 text-[10px] leading-relaxed ${SEVERITY_STYLE[w.severity]}`}
              >
                <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${SEVERITY_DOT[w.severity]}`} />
                {w.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {synergies.length > 0 && (
        <div>
          <p className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground mb-2">
            SYNERGIES
          </p>
          <div className="flex flex-col gap-1.5">
            {synergies.map((note, i) => (
              <div
                key={i}
                className="flex gap-2 rounded border border-emerald-500/15 bg-emerald-500/5 p-2.5 text-[10px] leading-relaxed text-emerald-300/90"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                {note}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground mb-2">
          CONSTRAINTS
        </p>
        <div className="flex flex-col gap-1.5">
          {constraints.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded border border-border/20 bg-surface/20 px-3 py-1.5">
              <span className="font-mono text-[10px] text-muted-foreground">{c.label}</span>
              <div className="flex gap-1">
                {Object.entries(c.dimensionWeights).map(([dim, w]) => (
                  <span key={dim} className="font-mono text-[9px] text-accent/70 border border-accent/15 bg-accent/5 px-1 rounded">
                    {dim.slice(0, 3)} ×{w}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── BUILDING SCREEN ──────────────────────────────────────────────────────────

function BuildingScreen({
  run,
  onToggleComponent,
  onActivateZone,
  onRemoveComponent,
  onSubmit,
}: {
  run: RunState
  onToggleComponent: (compId: string) => void
  onActivateZone: (zoneId: string | null) => void
  onRemoveComponent: (compId: string) => void
  onSubmit: () => void
}) {
  const scores = useMemo(() => computeSystemScores(run.placed), [run.placed])
  const total = useMemo(() => computeWeightedTotal(scores, run.constraints), [scores, run.constraints])
  const warnings = useMemo(
    () => getWarnings(run.placed, run.constraints.map((c) => c.id)),
    [run.placed, run.constraints]
  )
  const synergies = useMemo(() => getSynergies(run.placed), [run.placed])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_260px] gap-5 min-h-[calc(100vh-7rem)]">
      {/* Left: Library (desktop) */}
      <div className="hidden lg:flex flex-col border-r border-border/20 pr-4 overflow-hidden max-h-[calc(100vh-7rem)]">
        <ComponentLibrary
          placed={run.placed}
          activeZoneId={run.activeZoneId}
          onToggle={onToggleComponent}
          onActivateZone={onActivateZone}
        />
      </div>

      {/* Mobile: library collapsible */}
      <div className="lg:hidden">
        <details className="border border-border/30 rounded">
          <summary className="px-4 py-3 font-mono text-[10px] text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors">
            COMPONENT LIBRARY ({Object.values(run.placed).flat().length} placed)
          </summary>
          <div className="p-3 border-t border-border/30 max-h-64 overflow-y-auto">
            <ComponentLibrary
              placed={run.placed}
              activeZoneId={run.activeZoneId}
              onToggle={onToggleComponent}
              onActivateZone={onActivateZone}
            />
          </div>
        </details>
      </div>

      {/* Center: Canvas */}
      <div className="overflow-y-auto max-h-[calc(100vh-7rem)]">
        <ArchitectureCanvas
          challenge={run.challenge}
          constraints={run.constraints}
          placed={run.placed}
          activeZoneId={run.activeZoneId}
          onActivateZone={onActivateZone}
          onRemove={onRemoveComponent}
          onSubmit={onSubmit}
        />
      </div>

      {/* Right: Analysis */}
      <div className="lg:border-l lg:border-border/20 lg:pl-4 overflow-y-auto max-h-[calc(100vh-7rem)]">
        <TradeoffEngine
          scores={scores}
          total={total}
          warnings={warnings}
          synergies={synergies}
          constraints={run.constraints}
          placed={run.placed}
        />
      </div>
    </div>
  )
}

// ─── COMPLETE SCREEN ──────────────────────────────────────────────────────────

function CompleteScreen({
  run,
  onRetry,
}: {
  run: RunState
  onRetry: () => void
}) {
  const [solutionOpen, setSolutionOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const scores = useMemo(() => computeSystemScores(run.placed), [run.placed])
  const total = useMemo(() => computeWeightedTotal(scores, run.constraints), [scores, run.constraints])
  const warnings = useMemo(
    () => getWarnings(run.placed, run.constraints.map((c) => c.id)),
    [run.placed, run.constraints]
  )
  const synergies = useMemo(() => getSynergies(run.placed), [run.placed])

  const { label, color } = scoreTier(total)
  const dims = Object.keys(SCORE_LABELS) as (keyof ScoreDimension)[]

  const strengths = dims.filter((d) => scores[d] >= 7.5).map((d) => SCORE_LABELS[d])
  const weakPoints = dims.filter((d) => scores[d] < 5).map((d) => SCORE_LABELS[d])

  const handleShare = async () => {
    const text = `I scored ${total}/100 building "${run.challenge.title}" on Forge — Bereket Lemma's interactive system design challenge. bereketlemma.com/forge`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // clipboard not available
    }
  }

  return (
    <div className="mx-auto max-w-3xl py-8">
      {/* Score hero */}
      <div className="text-center mb-10">
        <p className="font-mono text-[9px] tracking-[0.3em] text-muted-foreground mb-4">
          SYSTEM COMPLETE
        </p>
        <div className="inline-flex flex-col items-center gap-1 mb-3">
          <span className="font-mono text-8xl font-bold text-foreground leading-none">{total}</span>
          <span className="font-mono text-sm text-muted-foreground">/ 100</span>
        </div>
        <p className={`font-mono text-sm tracking-widest ${color} mb-0.5`}>{label}</p>
        <p className="font-mono text-[11px] text-muted-foreground">{run.challenge.title}</p>
        <div className="flex justify-center mt-4 gap-3">
          <button
            onClick={handleShare}
            className="font-mono text-[10px] tracking-widest px-4 py-2 border border-border/40 text-muted-foreground hover:border-accent/50 hover:text-accent transition-all rounded"
          >
            {copied ? "COPIED ✓" : "SHARE RESULT"}
          </button>
          <button
            onClick={onRetry}
            className="font-mono text-[10px] tracking-widest px-5 py-2 border border-accent text-accent hover:bg-accent hover:text-background transition-all rounded"
          >
            NEW CHALLENGE →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Score breakdown */}
        <div className="rounded-lg border border-border/40 bg-surface/50 p-5">
          <p className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground mb-4">
            SCORE BREAKDOWN
          </p>
          <div className="flex flex-col gap-3">
            {dims.map((dim) => (
              <ScoreBar key={dim} label={SCORE_LABELS[dim]} value={scores[dim]} />
            ))}
          </div>
        </div>

        {/* Analysis */}
        <div className="flex flex-col gap-3">
          {strengths.length > 0 && (
            <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-4">
              <p className="font-mono text-[9px] tracking-widest text-emerald-400/70 mb-2.5">STRENGTHS</p>
              <div className="flex flex-col gap-1.5">
                {strengths.map((s) => (
                  <div key={s} className="flex items-center gap-2 font-mono text-[10px] text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}
          {weakPoints.length > 0 && (
            <div className="rounded-lg border border-red-500/15 bg-red-500/5 p-4">
              <p className="font-mono text-[9px] tracking-widest text-red-400/70 mb-2.5">WEAK POINTS</p>
              <div className="flex flex-col gap-1.5">
                {weakPoints.map((r) => (
                  <div key={r} className="flex items-center gap-2 font-mono text-[10px] text-red-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                    {r}
                  </div>
                ))}
              </div>
            </div>
          )}
          {synergies.length > 0 && (
            <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-4">
              <p className="font-mono text-[9px] tracking-widest text-emerald-400/70 mb-2.5">SYNERGIES</p>
              <div className="flex flex-col gap-1.5">
                {synergies.slice(0, 3).map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-[10px] text-emerald-300 leading-relaxed">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}
          {warnings.filter((w) => w.severity === "critical").length > 0 && (
            <div className="rounded-lg border border-red-500/15 bg-red-500/5 p-4">
              <p className="font-mono text-[9px] tracking-widest text-red-400/70 mb-2.5">CRITICAL RISKS</p>
              <div className="flex flex-col gap-1.5">
                {warnings.filter((w) => w.severity === "critical").map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-[10px] text-red-300 leading-relaxed">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                    {w.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* How I Would Build It */}
      <div className="rounded-lg border border-border/40 bg-surface/40 overflow-hidden mb-8">
        <button
          onClick={() => setSolutionOpen(!solutionOpen)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface/60 transition-colors text-left"
        >
          <div>
            <p className="font-mono text-xs font-semibold text-foreground">How I Would Build It</p>
            <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
              My architecture decisions, reasoning, and production considerations
            </p>
          </div>
          <span className="font-mono text-base text-muted-foreground ml-4 shrink-0">
            {solutionOpen ? "−" : "+"}
          </span>
        </button>

        {solutionOpen && (
          <div className="border-t border-border/25 px-5 py-5 flex flex-col gap-6">
            {/* Zone comparison */}
            <div>
              <p className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground mb-3">
                MY STACK vs. YOURS
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ZONES.map((zone) => {
                  const myIds = run.challenge.solution.placed[zone.id] ?? []
                  const yourIds = run.placed[zone.id] ?? []
                  const myNames = myIds.map((id) => getComponentById(id)?.name ?? id)
                  const yourNames = yourIds.map((id) => getComponentById(id)?.name ?? id)
                  const isMatch = JSON.stringify([...myIds].sort()) === JSON.stringify([...yourIds].sort())
                  const hasContent = myIds.length > 0 || yourIds.length > 0

                  if (!hasContent && !zone.required) return null

                  return (
                    <div
                      key={zone.id}
                      className={`rounded border p-3 ${
                        isMatch
                          ? "border-emerald-500/15 bg-emerald-500/5"
                          : "border-border/30 bg-surface/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-mono text-[9px] tracking-wider text-muted-foreground">
                          {zone.label.toUpperCase()}
                        </p>
                        <span className={`font-mono text-sm ${isMatch ? "text-emerald-400" : "text-amber-400"}`}>
                          {isMatch ? "✓" : "≠"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div>
                          <span className="font-mono text-[8px] text-muted-foreground/60 uppercase">You</span>
                          <p className={`font-mono text-[10px] mt-0.5 ${isMatch ? "text-emerald-300" : "text-amber-300/90"}`}>
                            {yourNames.length > 0 ? yourNames.join(", ") : "—"}
                          </p>
                        </div>
                        <div>
                          <span className="font-mono text-[8px] text-muted-foreground/60 uppercase">Mine</span>
                          <p className="font-mono text-[10px] text-foreground/80 mt-0.5">
                            {myNames.length > 0 ? myNames.join(", ") : "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Reasoning */}
            <div>
              <p className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground mb-2.5">
                REASONING
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {run.challenge.solution.summary}
              </p>
            </div>

            {/* Tradeoffs */}
            <div>
              <p className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground mb-2.5">
                TRADEOFFS I&apos;M ACCEPTING
              </p>
              <div className="flex flex-col gap-2">
                {run.challenge.solution.tradeoffs.map((t, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/50" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Production notes */}
            <div>
              <p className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground mb-2.5">
                PRODUCTION CONSIDERATIONS
              </p>
              <div className="flex flex-col gap-2">
                {run.challenge.solution.productionNotes.map((n, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/15" />
                    {n}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={onRetry}
          className="font-mono text-sm tracking-widest px-10 py-3.5 border border-accent text-accent hover:bg-accent hover:text-background transition-all duration-200 rounded"
        >
          RETRY — NEW CHALLENGE →
        </button>
      </div>
    </div>
  )
}

// ─── MAIN ORCHESTRATOR ────────────────────────────────────────────────────────

export default function ForgeGame() {
  const [phase, setPhase] = useState<GamePhase>("start")
  const [run, setRun] = useState<RunState>(() => {
    const { challenge, constraints } = getRandomRun()
    return { challenge, constraints, placed: {}, activeZoneId: null }
  })

  const handleStart = useCallback(() => setPhase("building"), [])

  const handleToggleComponent = useCallback((compId: string) => {
    const comp = COMPONENTS.find((c) => c.id === compId)
    if (!comp) return
    const zoneId = comp.zoneId
    const zone = ZONES.find((z) => z.id === zoneId)
    if (!zone) return

    setRun((prev) => {
      const zonePlaced = prev.placed[zoneId] ?? []
      const isPlaced = zonePlaced.includes(compId)

      if (isPlaced) {
        return {
          ...prev,
          placed: { ...prev.placed, [zoneId]: zonePlaced.filter((id) => id !== compId) },
        }
      }
      if (zonePlaced.length >= zone.maxSlots) return prev
      return {
        ...prev,
        placed: { ...prev.placed, [zoneId]: [...zonePlaced, compId] },
        activeZoneId: null,
      }
    })
  }, [])

  const handleActivateZone = useCallback((zoneId: string | null) => {
    setRun((prev) => ({ ...prev, activeZoneId: zoneId }))
  }, [])

  const handleRemoveComponent = useCallback((compId: string) => {
    const comp = COMPONENTS.find((c) => c.id === compId)
    if (!comp) return
    setRun((prev) => ({
      ...prev,
      placed: {
        ...prev.placed,
        [comp.zoneId]: (prev.placed[comp.zoneId] ?? []).filter((id) => id !== compId),
      },
    }))
  }, [])

  const handleSubmit = useCallback(() => setPhase("complete"), [])

  const handleRetry = useCallback(() => {
    const { challenge, constraints } = getRandomRun()
    setRun({ challenge, constraints, placed: {}, activeZoneId: null })
    setPhase("start")
  }, [])

  return (
    <div className="min-h-[calc(100vh-5rem)]">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between mb-5 border-b border-border/20 pb-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-accent font-semibold tracking-[0.2em]">FORGE</span>
          {phase !== "start" && (
            <>
              <span className="font-mono text-xs text-border">/</span>
              <span className="font-mono text-xs text-muted-foreground capitalize">{phase}</span>
            </>
          )}
        </div>
        {phase !== "start" && (
          <button
            onClick={handleRetry}
            className="font-mono text-[10px] tracking-widest text-muted-foreground hover:text-accent transition-colors"
          >
            NEW RUN ↺
          </button>
        )}
      </div>

      {phase === "start" && (
        <StartScreen
          challenge={run.challenge}
          constraints={run.constraints}
          onStart={handleStart}
        />
      )}

      {phase === "building" && (
        <BuildingScreen
          run={run}
          onToggleComponent={handleToggleComponent}
          onActivateZone={handleActivateZone}
          onRemoveComponent={handleRemoveComponent}
          onSubmit={handleSubmit}
        />
      )}

      {phase === "complete" && (
        <CompleteScreen run={run} onRetry={handleRetry} />
      )}
    </div>
  )
}
