"use client"

import { useCallback, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Activity,
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Database,
  Download,
  GitBranch,
  GripVertical,
  Info,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Waypoints,
  X,
  Zap,
} from "lucide-react"
import {
  CHALLENGES,
  COMPONENTS,
  CONS,
  CONSTRAINTS,
  PROS,
  SCORE_LABELS,
  ZONES,
  classifyMatchQuality,
  computeConstraintFitScore,
  computeCoverageScore,
  computeSolutionMatchScore,
  computeSystemScores,
  computeWeightedTotal,
  getComponentById,
  getSynergies,
  getWarnings,
  type Challenge,
  type Constraint,
  type ForgeComponent,
  type MatchQuality,
  type ScoreDimension,
  type WarningMessage,
} from "../_data"

// ─── Types ────────────────────────────────────────────────────────────────────

type GamePhase = "building" | "complete"
type PlacedState = Record<string, string[]>
type ScoreKey = keyof ScoreDimension

type RunState = {
  challenge: Challenge
  constraints: Constraint[]
  placed: PlacedState
}

type Evaluation = {
  scores: ScoreDimension
  finalScore: number
  architectureScore: number
  solutionMatchScore: number
  coverageScore: number
  constraintFitScore: number
  readiness: number
  tier: string
  warnings: WarningMessage[]
  synergies: string[]
  risks: string[]
  decisions: string[]
  breakPoint: string
  scoreExplanation: string
}

type FailureScenario = { trigger: string; bottleneck: string; what: string; fix: string }
type Suggestion = { component: string; gain: number; why: string }

// ─── Design tokens (single accent: amber, zone colors only on stripes/icons) ──

const ZONE_COLOR: Record<string, string> = {
  traffic:      "#818CF8",
  compute:      "#FBBF24",
  data:         "#34D399",
  async:        "#A78BFA",
  security:     "#F87171",
  observability:"#38BDF8",
}

const ZONE_ICON: Record<string, typeof GitBranch> = {
  traffic: Waypoints, compute: Zap, data: Database,
  async: GitBranch, security: ShieldCheck, observability: Activity,
}

const ZONE_PROMPT: Record<string, string> = {
  traffic:      "Where does traffic enter first?",
  compute:      "What runs the business logic?",
  data:         "Where does the data actually live?",
  async:        "What absorbs work when traffic bursts?",
  security:     "What checks identity and keeps secrets?",
  observability:"How do you find out when things break?",
}

const MATCH_STYLE: Record<MatchQuality, { border:string; bg:string; text:string }> = {
  "exact-match":     { border:"rgba(52,211,153,.35)",  bg:"rgba(52,211,153,.08)",  text:"#34D399" },
  "good-alternative":{ border:"rgba(56,189,248,.35)",  bg:"rgba(56,189,248,.08)",  text:"#38BDF8" },
  "partial-match":   { border:"rgba(245,199,107,.35)", bg:"rgba(245,199,107,.07)", text:"#F5C76B" },
  missing:           { border:"rgba(248,113,113,.48)", bg:"rgba(248,113,113,.11)", text:"#F87171" },
  overbuilt:         { border:"rgba(167,139,250,.35)", bg:"rgba(167,139,250,.08)", text:"#A78BFA" },
  "risky-mismatch":  { border:"rgba(251,113,133,.48)", bg:"rgba(251,113,133,.11)", text:"#FB7185" },
}

const MATCH_LABEL: Record<MatchQuality, string> = {
  "exact-match":"Exact Match","good-alternative":"Good Alternative",
  "partial-match":"Partial Match",missing:"Missing",overbuilt:"Overbuilt","risky-mismatch":"Risky Mismatch",
}

const FORGE_SURFACE = {
  page: "radial-gradient(ellipse at 50% -15%, rgba(201,123,42,.07) 0%, transparent 55%), hsl(60,7%,4%)",
  sidebar: "#111110",
  sidebarHeader: "#0D0D0B",
  canvas: "#111110",
  canvasHeader: "#0D0D0B",
  card: "#1A1815",
  stage: "#1E1B16",
  stageActive: "#252019",
  chip: "#201D18",
  overlay: "#111110",
  overlayPanel: "#0F0E0C",
} as const


// ─── Stages (all unlocked) ────────────────────────────────────────────────────

const BUILD_STAGES = [
  { id:"traffic",      label:"Traffic & Edge",    short:"Route and protect incoming requests", categories:["Traffic & Edge"] },
  { id:"compute",      label:"Application Layer", short:"Run the business logic",               categories:["Application Layer"] },
  { id:"data",         label:"Data Layer",         short:"Store and cache state",               categories:["Databases","Cache","Storage"] },
  { id:"async",        label:"Async Processing",   short:"Absorb burst work off the request path",categories:["Async Processing"] },
  { id:"security",     label:"Security",           short:"Check identity and keep secrets safe", categories:["Authentication","Secrets"] },
  { id:"observability",label:"Observability",      short:"Know when something breaks",          categories:["Observability"] },
] as const

const SCORE_KEYS  = Object.keys(SCORE_LABELS) as ScoreKey[]
const STAGE_ORDER = BUILD_STAGES.map((s) => s.id)

// ─── Logic ────────────────────────────────────────────────────────────────────

function constraintsFor(c: Challenge) {
  return c.constraintPool.map((id) => CONSTRAINTS.find((x) => x.id === id)).filter(Boolean) as Constraint[]
}
function createRun(id = "auth-system"): RunState {
  const c = CHALLENGES.find((x) => x.id === id) ?? CHALLENGES[0]
  return { challenge: c, constraints: constraintsFor(c).slice(0,3), placed: {} }
}
function randomRun(exclude?: string): RunState {
  const pool = CHALLENGES.length > 1 ? CHALLENGES.filter((c) => c.id !== exclude) : CHALLENGES
  return createRun((pool[Math.floor(Math.random() * pool.length)] ?? CHALLENGES[0]).id)
}

function clamp10(v: number) { return Math.max(0, Math.min(10, v)) }
function hasAny(p: PlacedState, z: string) { return (p[z] ?? []).length > 0 }
function allIds(p: PlacedState) { return Object.values(p).flat() }
function cids(cs: Constraint[]) { return cs.map((c) => c.id) }
function needsAsync(cs: Constraint[]) { return cids(cs).some((id) => ["burst-traffic","high-throughput","real-time"].includes(id)) }
function needsEdge(cs: Constraint[])  { return cids(cs).some((id) => ["global-scale","multi-region","low-latency","security-first"].includes(id)) }

function adjustedScores(p: PlacedState, cs: Constraint[]): ScoreDimension {
  const s = { ...computeSystemScores(p) }
  const pen = (d: ScoreKey, n: number) => { s[d] = clamp10(s[d] - n) }
  if (!hasAny(p,"compute"))               { pen("reliability",2.4); pen("scalability",1.8); pen("latency",1.2) }
  if (!hasAny(p,"data"))                  { pen("reliability",3);   pen("scalability",1.4); pen("security",0.8) }
  if (!hasAny(p,"security"))              { pen("security",3.5);    pen("reliability",1.2) }
  if (!hasAny(p,"observability"))         { pen("reliability",1.5); pen("security",0.6) }
  if (needsAsync(cs) && !hasAny(p,"async"))  { pen("scalability",2.2); pen("reliability",1) }
  if (needsEdge(cs)  && !hasAny(p,"traffic")){ pen("latency",1.5);    pen("security",1);    pen("scalability",1.1) }
  return s
}

function readinessScore(p: PlacedState, ws: WarningMessage[], cs: Constraint[]) {
  const covered = ZONES.filter((z) => hasAny(p, z.id)).length
  return clamp10(
    (covered / ZONES.length) * 10 + 1.2
    - ws.filter((w) => w.severity === "critical").length * 1.4
    - ws.filter((w) => w.severity === "warning").length * 0.45
    - (needsAsync(cs) && !hasAny(p,"async")   ? 1.1 : 0)
    - (needsEdge(cs)  && !hasAny(p,"traffic") ? 0.9 : 0)
  )
}

function computeFS(run: RunState) {
  const sc = adjustedScores(run.placed, run.constraints)
  const arch = computeWeightedTotal(sc, run.constraints)
  const c = cids(run.constraints)
  const sm = computeSolutionMatchScore(run.placed, run.challenge) * 10
  const cv = computeCoverageScore(run.placed, c) * 10
  const cf = computeConstraintFitScore(run.placed, c) * 10
  return {
    finalScore: Math.max(0, Math.min(100, Math.round(.45*arch + .35*sm + .15*cv + .05*cf))),
    architectureScore: arch, solutionMatchScore: Math.round(sm),
    coverageScore: Math.round(cv), constraintFitScore: Math.round(cf),
  }
}

function scoreTier(n: number, sc?: ScoreDimension) {
  if (sc && n >= 68 && sc.simplicity <= 3.8) return "Overengineered"
  if (n >= 92) return "Enterprise Grade"
  if (n >= 84) return "Production Ready"
  if (n >= 72) return "Startup Ready"
  if (n >= 58) return "Strong Prototype"
  if (n >= 40) return "Fragile MVP"
  return "Incident-Prone"
}
function tierColor(n: number) { return n >= 84 ? "#34D399" : n >= 58 ? "#FBBF24" : "#F87171" }

function buildVerdict(score: number, sc: ScoreDimension, run: RunState): string {
  const all = new Set(allIds(run.placed))
  if (!hasAny(run.placed,"security"))       return "Don't ship this. No authentication means anyone can hit your endpoints. Fix that first."
  if (!hasAny(run.placed,"data"))           return "This doesn't hold state yet. You need a data layer before this can do anything useful."
  if (!hasAny(run.placed,"observability") && score >= 70)
    return "Almost there, but you'd be flying blind. Add observability before launch or your first incident will take hours to find."
  if (score >= 90) return "Safe to ship. This is a solid production design. Keep an eye on your P99 latencies when real traffic hits."
  if (score >= 78) {
    if (sc.simplicity < 4) return "Shippable, but this needs a dedicated platform team. Make sure ops ownership is clear before launch."
    return "Shippable with caveats. Work through the risks on the left before you go live."
  }
  if (score >= 58) return "Good for a proof-of-concept. Needs real work before it sees production traffic."
  return "Not production-ready. Too many gaps. Pick your most important constraint and work backwards from there."
}

function buildExplanation(run: RunState, ev: { finalScore:number; solutionMatchScore:number; coverageScore:number; architectureScore:number }) {
  const parts: string[] = []
  if (ev.solutionMatchScore >= 80)      parts.push("Your design is close to what I'd build for this challenge.")
  else if (ev.solutionMatchScore >= 55) parts.push("You covered some of the right ground but took a different path in a few key areas.")
  else                                  parts.push("Your design heads in a different direction than what I'd recommend here.")
  if (ev.coverageScore < 60)            parts.push("Missing layers pulled the coverage score down.")
  if (ev.architectureScore >= 75)       parts.push("The components you chose score well on engineering quality.")
  else if (ev.architectureScore < 50)   parts.push("A few high-risk choices dragged the architecture score down.")
  return parts.join(" ")
}

function failureSimulation(run: RunState): FailureScenario[] {
  const scenarios: FailureScenario[] = []
  const p = run.placed
  const all = new Set(allIds(p))
  const cs = run.constraints

  if (hasAny(p,"data") && !all.has("redis") && (all.has("postgres") || all.has("mysql"))) {
    scenarios.push({
      trigger:"10x traffic spike",
      bottleneck:"Database connection pool",
      what:"Every request hits the database directly. At 10x load, connections run out, queries queue up, and response times climb past 5 seconds. Users see timeouts.",
      fix:"Add Redis and cache your most-read queries. The database should handle writes, not every read.",
    })
  }
  if (!hasAny(p,"async") && needsAsync(cs)) {
    scenarios.push({
      trigger:"Traffic burst",
      bottleneck:"App servers",
      what:"Background work runs synchronously in the request path. Under burst load, threads exhaust and new requests get dropped. Error rate spikes.",
      fix:"Add SQS or Kafka. Return 202 Accepted immediately and do the work in the background.",
    })
  }
  if (!all.has("rate-limiter")) {
    scenarios.push({
      trigger:"Bot or credential stuffing attack",
      bottleneck:"Auth endpoints",
      what:"Without rate limiting, a single aggressive client can flood your login endpoints and exhaust server threads for real users.",
      fix:"Add a rate limiter at the edge. Protect auth endpoints first, everything else second.",
    })
  }
  if (!hasAny(p,"observability")) {
    scenarios.push({
      trigger:"Silent degradation at 3am",
      bottleneck:"Operations team",
      what:"The system slows down, nobody knows until users complain. By the time you look into it, the logs have rotated and the root cause is gone.",
      fix:"Add Prometheus or Datadog and set P99 latency alerts before launch day.",
    })
  }
  if (scenarios.length === 0) {
    scenarios.push({
      trigger:"Downstream service timeout",
      bottleneck:"Retry storms",
      what:"If a dependency slows down and you have aggressive retry logic, retries can multiply the load 3-5x and overwhelm the already-struggling service.",
      fix:"Use exponential backoff with jitter on all retries. Circuit-break dependencies that consistently fail.",
    })
  }
  return scenarios.slice(0,2)
}

function improveSuggestions(run: RunState): Suggestion[] {
  const all = new Set(allIds(run.placed))
  const cs = run.constraints
  const ids = cids(cs)
  const sugg: Suggestion[] = []

  if (!hasAny(run.placed,"security"))      sugg.push({ component:"OAuth 2.0 or JWT Auth",  gain:12, why:"Missing security is the single biggest score hit" })
  if (!hasAny(run.placed,"observability")) sugg.push({ component:"Datadog or Prometheus",  gain:8,  why:"No observability tanks reliability and production readiness" })
  if (!hasAny(run.placed,"data"))          sugg.push({ component:"PostgreSQL + Redis",      gain:10, why:"No data layer means no persistence" })
  if (!all.has("secrets-manager") && hasAny(run.placed,"security"))
    sugg.push({ component:"Secrets Manager", gain:4, why:"Expected in any production security setup" })
  if (!all.has("rate-limiter") && ids.includes("security-first"))
    sugg.push({ component:"Rate Limiter",    gain:5, why:"Required for your Security-First constraint" })
  if (!hasAny(run.placed,"async") && needsAsync(cs))
    sugg.push({ component:"SQS or Kafka",    gain:6, why:"Your constraint requires an async layer" })
  if (!all.has("cdn") && needsEdge(cs))
    sugg.push({ component:"CDN",             gain:3, why:"Low-Latency constraint benefits from edge caching" })

  return sugg.sort((a,b) => b.gain - a.gain).slice(0,3)
}

function missingRisks(p: PlacedState, cs: Constraint[]) {
  const risks: string[] = []
  if (!hasAny(p,"security"))               risks.push("No authentication. Any user can hit any endpoint.")
  if (!hasAny(p,"data"))                   risks.push("No data layer. The system can't persist anything.")
  if (!hasAny(p,"observability"))          risks.push("No observability. Your first incident will be guesswork.")
  if (needsAsync(cs) && !hasAny(p,"async"))  risks.push("No async layer. Burst traffic hits app servers directly.")
  if (needsEdge(cs)  && !hasAny(p,"traffic")) risks.push("No edge layer. Global latency will be painful.")
  // Always add realistic engineering risks even on good designs
  if (!Object.values(p).flat().includes("rate-limiter")) risks.push("No rate limiting. Brute force and scraping land on your origin servers.")
  if (!Object.values(p).flat().includes("secrets-manager")) risks.push("Secrets likely hardcoded or in env vars. One breach exposes everything.")
  return risks.slice(0,6)
}

function bestDecisions(p: PlacedState, syn: string[]) {
  const synShort = syn.slice(0,2).map((s) => {
    const idx = s.indexOf(".")
    return idx > 0 ? s.slice(0, idx) : s.slice(0, 60)
  })
  const comps = (allIds(p).map(getComponentById).filter(Boolean) as ForgeComponent[])
    .map((c) => ({ c, s: c.scores.reliability + c.scores.security + c.scores.scalability + c.scores.latency }))
    .sort((a,b) => b.s - a.s).slice(0,4)
    .map(({ c }) => c.name)
  return [...synShort, ...comps].slice(0,5)
}

function breaksFirst(p: PlacedState, cs: Constraint[], sc: ScoreDimension): string {
  const set = new Set(allIds(p)), ids = cids(cs)
  if (!hasAny(p,"security"))                           return "Abuse breaks first. Without authentication, attackers walk straight in."
  if (!hasAny(p,"data"))                               return "State breaks first. Requests arrive but there's nowhere to store the result."
  if (needsAsync(cs) && !hasAny(p,"async"))            return "Burst traffic breaks first. Background work runs synchronously until threads exhaust."
  if (needsEdge(cs)  && !hasAny(p,"traffic"))          return "The edge breaks first. Global users hit your origin directly, latency and protection both fail."
  if (set.has("mongodb") && ids.includes("strong-consistency")) return "Consistency breaks first. MongoDB's flexibility creates partial-write bugs under transaction pressure."
  if (set.has("polling"))                              return "The request layer breaks first. Polling creates a thundering herd as traffic grows."
  if (set.has("kubernetes") && !hasAny(p,"observability")) return "Operations break first. Kubernetes restarts pods silently and you won't know why."
  if (sc.simplicity < 4)                              return "The team breaks first. Complexity slows incident response when something goes wrong at 3am."
  return "The first failure is probably operational. A dependency slows, retries pile up, and without backpressure the blast radius grows."
}

function liveMsgs(p: PlacedState, cs: Constraint[], ws: WarningMessage[], syn: string[]): WarningMessage[] {
  const set = new Set(allIds(p))
  const msgs: WarningMessage[] = ws.map((w) => {
    if (w.message.startsWith("No authentication")) return { ...w, message:"Security gap: no authentication means any user can hit any endpoint." }
    if (w.message.startsWith("No data layer"))     return { ...w, message:"Durability gap: without a data layer, nothing persists between requests." }
    if (w.message.startsWith("No observability"))  return { ...w, message:"Blind spot: no observability means your first incident will take hours to diagnose." }
    return w
  })
  allIds(p).map(getComponentById).filter(Boolean).slice(-3).forEach((c) => {
    if (!c) return
    const top = SCORE_KEYS.map((k) => ({ k, v: c.scores[k] })).sort((a,b) => b.v - a.v)[0]
    const note = c.tags.includes("complex") ? "Adds operational complexity, plan for it." : (CONS[c.id]?.[0] ?? c.tradeoffNote)
    msgs.unshift({ message: `${SCORE_LABELS[top.k]} improved with ${c.name}. ${note}`, severity: c.tags.includes("risky") || c.tags.includes("complex") ? "warning" : "info" })
  })
  if (!hasAny(p,"traffic") && needsEdge(cs))  msgs.push({ message:"No edge layer means global traffic goes straight to your app servers. Expect latency problems.", severity:"warning" })
  if (!hasAny(p,"async")   && needsAsync(cs)) msgs.push({ message:"No async layer means every background job runs in the user request path. That will hurt under load.", severity:"warning" })
  if (!hasAny(p,"observability"))              msgs.push({ message:"No observability makes your first incident significantly harder to diagnose and fix.", severity:"warning" })
  if (!set.has("rate-limiter") && cids(cs).includes("security-first")) msgs.push({ message:"No rate limiting on a security-first system is a problem. Brute force goes straight to your origin.", severity:"warning" })
  if (set.has("kafka")) msgs.push({ message:"Kafka is a strong call for throughput. Just make sure your consumers are idempotent, it delivers at least once.", severity:"info" })
  if (set.has("cdn"))   msgs.push({ message:"Good call on CDN. Most read traffic should never hit your origin once this is configured right.", severity:"info" })
  if (set.has("redis")) msgs.push({ message:"Redis improves latency a lot. Just design your cache invalidation logic deliberately or you'll get stale data.", severity:"info" })
  syn.slice(0,2).forEach((m) => msgs.push({ message: m, severity:"info" }))
  return msgs.slice(0,9)
}

// ─── Markdown ─────────────────────────────────────────────────────────────────

function buildMd(run: RunState, ev: Evaluation): string {
  const L: string[] = ["# Forge Architecture Review",""]
  L.push("## Challenge",`**${run.challenge.title}**`,"",run.challenge.description,"")
  L.push("## Constraints",...run.constraints.map((c)=>`- ${c.label}`),"")
  L.push("## Final Score",`**${ev.finalScore} / 100** -- ${ev.tier}`,"")
  L.push("## Score Explanation",ev.scoreExplanation,"")
  L.push("## Selected Architecture")
  BUILD_STAGES.forEach((stage)=>{
    L.push(`\n### ${stage.label}`)
    const ids=run.placed[stage.id]??[]
    if(!ids.length){L.push("_Nothing placed._");return}
    ids.forEach((id)=>{const c=getComponentById(id);if(!c)return;L.push(`\n**${c.name}**`,`- Purpose: ${c.useCase}`,`- Tradeoff: ${c.tradeoffNote}`)})
  })
  L.push("","## Score Breakdown")
  SCORE_KEYS.forEach((k)=>L.push(`- **${k==="cost"?"Cost Efficiency":SCORE_LABELS[k]}**: ${ev.scores[k].toFixed(1)} / 10`))
  L.push(`- **Architecture Quality**: ${ev.architectureScore} / 100`,`- **Solution Match**: ${ev.solutionMatchScore} / 100`,`- **Coverage**: ${ev.coverageScore} / 100`,`- **Constraint Fit**: ${ev.constraintFitScore} / 100`)
  L.push("","## Biggest Risks",...ev.risks.map((r)=>`- ${r}`))
  L.push("","## Strongest Decisions",...ev.decisions.map((d)=>`- ${d}`))
  L.push("","## What Breaks First?",ev.breakPoint,"")
  L.push("## My Design vs Your Design")
  ZONES.forEach((zone)=>{
    const yours=run.placed[zone.id]??[],mine=run.challenge.solution.placed[zone.id]??[]
    const all=Array.from(new Set([...mine,...yours]));if(!all.length)return
    L.push(`\n### ${zone.label}`)
    all.forEach((id)=>{
      const yc=yours.includes(id)?getComponentById(id):undefined
      const mc=mine.includes(id)?getComponentById(id):undefined
      const q=classifyMatchQuality(yc?.id,mc?.id,cids(run.constraints))
      L.push(`- Your choice: ${yc?.name??"None"}`,`- My design: ${mc?.name??"None"}`,`- Match: ${MATCH_LABEL[q]}`)
    })
  })
  return L.join("\n")
}

function pdfSafeText(s: string) {
  return s
    .replace(/[•·]/g,"-")
    .replace(/[–—]/g,"-")
    .replace(/[“”]/g,'"')
    .replace(/[‘’]/g,"'")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g,"")
    .replace(/\\/g,"\\\\")
    .replace(/\(/g,"\\(")
    .replace(/\)/g,"\\)")
}

function reportLinesForPdf(run: RunState, ev: Evaluation) {
  return buildMd(run,ev)
    .replace(/^# /gm,"")
    .replace(/^## /gm,"")
    .replace(/^### /gm,"")
    .replace(/\*\*/g,"")
    .replace(/_/g,"")
    .split("\n")
}

function wrapPdfLines(lines: string[], maxChars = 88) {
  const out: string[] = []
  lines.forEach((line)=>{
    let text=line.trimEnd()
    if(!text){out.push("");return}
    while(text.length>maxChars){
      const cut=Math.max(text.lastIndexOf(" ",maxChars),Math.floor(maxChars*.72))
      out.push(text.slice(0,cut).trimEnd())
      text=text.slice(cut).trimStart()
    }
    out.push(text)
  })
  return out
}

function buildPdf(run: RunState, ev: Evaluation) {
  const lines=wrapPdfLines(reportLinesForPdf(run,ev))
  const linesPerPage=52
  const pages:string[][]=[]
  for(let i=0;i<lines.length;i+=linesPerPage)pages.push(lines.slice(i,i+linesPerPage))

  const objects:string[]=[
    "<< /Type /Catalog /Pages 2 0 R >>",
    "",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ]
  const pageRefs:string[]=[]

  pages.forEach((pageLines)=>{
    const content=[
      "BT",
      "/F1 10 Tf",
      "13 TL",
      "48 744 Td",
      ...pageLines.map((line)=>line?`(${pdfSafeText(line)}) Tj T*`:"T*"),
      "ET",
    ].join("\n")
    const contentObj=objects.length+1
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`)
    const pageObj=objects.length+1
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObj} 0 R >>`)
    pageRefs.push(`${pageObj} 0 R`)
  })
  objects[1]=`<< /Type /Pages /Kids [${pageRefs.join(" ")}] /Count ${pages.length} >>`

  let pdf="%PDF-1.4\n"
  const offsets:number[]=[]
  objects.forEach((obj,idx)=>{
    offsets.push(pdf.length)
    pdf+=`${idx+1} 0 obj\n${obj}\nendobj\n`
  })
  const xref=pdf.length
  pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`
  offsets.forEach((offset)=>{pdf+=`${String(offset).padStart(10,"0")} 00000 n \n`})
  pdf+=`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  return pdf
}

function downloadReport(run: RunState, ev: Evaluation) {
  const blob=new Blob([buildPdf(run,ev)],{type:"application/pdf"})
  const url=URL.createObjectURL(blob)
  const a=document.createElement("a");a.href=url;a.download=`forge-${run.challenge.id}.pdf`;a.click()
  URL.revokeObjectURL(url)
}

// ─── Component Library ────────────────────────────────────────────────────────

function ComponentCard({component,isPlaced,isSelected,onSelect,onDragStart}:{
  component:ForgeComponent;isPlaced:boolean;isSelected:boolean
  onSelect:(id:string)=>void;onDragStart:(id:string)=>void
}){
  return(
    <button draggable
      onDragStart={(e)=>{e.dataTransfer.setData("text/plain",component.id);e.dataTransfer.effectAllowed="copy";onDragStart(component.id)}}
      onClick={()=>onSelect(component.id)}
      className="group w-full text-left"
      style={{
        display:"flex",gap:7,alignItems:"flex-start",padding:"8px 9px",borderRadius:9,cursor:"grab",
        border:`1px solid ${isSelected?"rgba(230,162,60,.6)":component.tags.includes("risky")?"rgba(248,113,113,.22)":"rgba(255,255,255,.1)"}`,
        background:isSelected?"rgba(230,162,60,.07)":component.tags.includes("risky")?"rgba(248,113,113,.04)":component.tags.includes("complex")?"rgba(167,139,250,.03)":FORGE_SURFACE.card,
        boxShadow:isSelected?"inset 3px 0 0 #E6A23C":undefined,
        opacity:isPlaced?.35:1,transition:"border-color .12s,background .12s",
      }}
    >
      <GripVertical size={13} style={{color:"rgba(255,255,255,.22)",marginTop:3,flexShrink:0}}/>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6,marginBottom:3}}>
          <p style={{fontSize:13,fontWeight:700,color:"#F0EBE3",margin:0,lineHeight:1.2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{component.name}</p>
          {isPlaced&&<span style={{fontSize:10,color:"#E6A23C",background:"rgba(230,162,60,.14)",border:"1px solid rgba(230,162,60,.35)",borderRadius:4,padding:"1px 7px",fontWeight:700,flexShrink:0}}>Placed</span>}
        </div>
        <p style={{fontSize:12,color:"#B5A99B",margin:"0 0 4px",lineHeight:1.45,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{component.useCase}</p>
        <p style={{fontSize:10,color:"#8A8078",fontWeight:600,margin:0,textAlign:"right"}}>Drag or click</p>
      </div>
    </button>
  )
}

function ComponentLibrary({placed,selectedId,onSelect,onDragStart}:{
  placed:PlacedState;selectedId:string|null;onSelect:(id:string)=>void;onDragStart:(id:string)=>void
}){
  const placed_set=useMemo(()=>new Set(allIds(placed)),[placed])
  const [open,setOpen]=useState<string|null>("traffic")
  const doneCount=STAGE_ORDER.filter((z)=>hasAny(placed,z)).length

  return(
    <aside style={{display:"flex",flexDirection:"column",height:"100%",background:FORGE_SURFACE.sidebar,borderRight:"1px solid rgba(255,255,255,.08)"}}>
      <div style={{padding:"18px 16px 14px",borderBottom:"1px solid rgba(255,255,255,.08)",background:FORGE_SURFACE.sidebarHeader,flexShrink:0}}>
        <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.26em",color:"#8A8078",textTransform:"uppercase",margin:"0 0 10px"}}>Components</p>
        <div style={{display:"flex",gap:3,marginBottom:10}}>
          {BUILD_STAGES.map((s)=>{
            const done=hasAny(placed,s.id),color=ZONE_COLOR[s.id]??"#888"
            return <div key={s.id} title={s.label} style={{flex:1,height:3,borderRadius:99,background:done?color:"rgba(255,255,255,.08)",transition:"background .3s"}}/>
          })}
        </div>
        <p style={{fontSize:12,color:"#B5A99B",margin:0,lineHeight:1.5}}>
          {doneCount===0?"All stages are open. Drag or click to place.":doneCount===6?"All stages filled. Ready to submit.": `${doneCount} of 6 stages filled.`}
        </p>
      </div>

      <div style={{flex:1,overflowY:"auto",overflowX:"hidden",padding:"7px 8px"}}>
        {BUILD_STAGES.map((stage)=>{
          const components=COMPONENTS.filter((c)=>(stage.categories as readonly string[]).includes(c.category))
          if(!components.length)return null
          const isOpen=open===stage.id
          const color=ZONE_COLOR[stage.id]??"#888"
          const Icon=ZONE_ICON[stage.id]??CircleDot
          const filled=hasAny(placed,stage.id)

          return(
            <div key={stage.id} style={{marginBottom:5}}>
              <button onClick={()=>setOpen(isOpen?null:stage.id)}
                style={{
                  width:"100%",display:"flex",alignItems:"center",gap:7,padding:"7px 9px",borderRadius:9,
                  background:isOpen?`${color}0C`:"rgba(255,255,255,.025)",
                  border:`1px solid ${isOpen?`${color}28`:filled?`${color}18`:"rgba(255,255,255,.08)"}`,
                  cursor:"pointer",transition:"all .15s",
                }}
              >
                <span style={{display:"flex",alignItems:"center",justifyContent:"center",width:20,height:20,borderRadius:7,background:`${color}18`,color,flexShrink:0}}>
                  <Icon size={11}/>
                </span>
                <div style={{flex:1,textAlign:"left",minWidth:0}}>
                  <p style={{fontSize:12,fontWeight:600,color:"#E0D8CE",margin:0}}>{stage.label}</p>
                  <p style={{fontSize:11,color:"#B5A99B",margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{stage.short}</p>
                </div>
                {filled&&<div style={{width:6,height:6,borderRadius:99,background:color,flexShrink:0}}/>}
                {isOpen?<ChevronDown size={13} style={{color:"rgba(255,255,255,.3)",flexShrink:0}}/>:<ChevronRight size={12} style={{color:"rgba(255,255,255,.2)",flexShrink:0}}/>}
              </button>
              {isOpen&&(
                <div style={{paddingTop:4,paddingLeft:4,paddingRight:4,display:"flex",flexDirection:"column",gap:5}}>
                  {components.map((c)=>(
                    <ComponentCard key={c.id} component={c}
                      isPlaced={placed_set.has(c.id)} isSelected={selectedId===c.id}
                      onSelect={onSelect} onDragStart={onDragStart}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}

// ─── Canvas: 2-row grid ───────────────────────────────────────────────────────

function HArrow({active}:{active:boolean}){
  const col=active?"#E6A23C":"rgba(255,255,255,.12)"
  return(
    <div style={{display:"flex",alignItems:"center",flexShrink:0,width:32,paddingBottom:4}}>
      <div style={{flex:1,height:1.5,background:col,transition:"background .3s"}}/>
      <svg width={7} height={11} viewBox="0 0 7 11" style={{flexShrink:0}}>
        <path d="M0 0 L7 5.5 L0 11" fill="none" stroke={col} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

function RowConnector({active}:{active:boolean}){
  const col=active?"#E6A23C":"rgba(255,255,255,.1)"
  return(
    <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center",paddingRight:8,height:28}}>
      <svg width={64} height={28} viewBox="0 0 64 28" style={{overflow:"visible"}}>
        <path d="M 64 0 L 64 14 Q 64 28 50 28 L 0 28" fill="none" stroke={col} strokeWidth={1.5} strokeLinecap="round" strokeDasharray={active?"none":"4 3"}/>
        <path d="M 8 21 L 0 28 L 8 35" fill="none" stroke={col} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" transform="translate(0,-7)"/>
      </svg>
    </div>
  )
}

function PlacedChip({id,onRemove}:{id:string;onRemove:(id:string)=>void}){
  const c=getComponentById(id);if(!c)return null
  const risky=c.tags.includes("risky")
  return(
    <motion.div layout initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.9}}
      transition={{type:"spring",stiffness:400,damping:30}} className="group"
      style={{display:"flex",alignItems:"center",gap:6,padding:"6px 8px 6px 10px",background:risky?"rgba(248,113,113,.1)":FORGE_SURFACE.chip,border:`1px solid ${risky?"rgba(248,113,113,.25)":"rgba(255,255,255,.12)"}`,borderRadius:8}}
    >
      <p style={{flex:1,fontSize:13,fontWeight:600,color:"#E0D8CE",margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.name}</p>
      <button onClick={(e)=>{e.stopPropagation();onRemove(id)}}
        style={{padding:2,background:"transparent",border:"none",cursor:"pointer",color:"rgba(255,255,255,.25)",borderRadius:4,display:"flex",transition:"all .1s"}}
        onMouseEnter={(e)=>{const b=e.currentTarget as HTMLButtonElement;b.style.color="#F87171";b.style.background="rgba(248,113,113,.14)"}}
        onMouseLeave={(e)=>{const b=e.currentTarget as HTMLButtonElement;b.style.color="rgba(255,255,255,.25)";b.style.background="transparent"}}
      ><X size={11}/></button>
    </motion.div>
  )
}

function StageBox({stage,placed,selectedId,isCurrent,onPlace,onRemove}:{
  stage:typeof BUILD_STAGES[number];placed:string[];selectedId:string|null
  isCurrent:boolean;onPlace:(id:string,z:string)=>boolean;onRemove:(id:string)=>void
}){
  const color=ZONE_COLOR[stage.id]??"#888"
  const Icon=ZONE_ICON[stage.id]??CircleDot
  const selComp=selectedId?getComponentById(selectedId):null
  const canReceive=selComp?.zoneId===stage.id

  const onDragOver=(e:React.DragEvent)=>{e.preventDefault();e.stopPropagation();e.dataTransfer.dropEffect="copy"}
  const onDrop=(e:React.DragEvent)=>{e.preventDefault();e.stopPropagation();const id=e.dataTransfer.getData("text/plain");if(id)onPlace(id,stage.id)}
  const onClick=()=>{if(selectedId)onPlace(selectedId,stage.id)}

  // Stage boxes stay lighter than the canvas so the workflow reads at a glance.
  const boxBg = isCurrent ? `linear-gradient(160deg,${color}10 0%,${FORGE_SURFACE.stageActive} 100%)` : FORGE_SURFACE.stage
  const boxBorder = canReceive ? `${color}80` : isCurrent ? `${color}50` : "rgba(255,255,255,.11)"
  const boxShadow = canReceive ? `0 0 0 2px ${color}60,0 8px 24px rgba(0,0,0,.4)` : isCurrent ? `0 0 0 1px ${color}20,0 16px 36px rgba(0,0,0,.4),0 0 28px ${color}08` : "0 8px 20px rgba(0,0,0,.3)"

  return(
    <div onDragOver={onDragOver} onDrop={onDrop} onClick={onClick}
      style={{flex:1,minHeight:0,display:"flex",flexDirection:"column",borderRadius:14,background:boxBg,border:`1.5px solid ${boxBorder}`,boxShadow,cursor:selectedId?"pointer":"default",transition:"all .2s",overflow:"hidden"}}
    >
      <div style={{height:3,background:`linear-gradient(90deg,${color} 0%,${color}00 100%)`,flexShrink:0}}/>
      <div style={{padding:"8px 12px",borderBottom:"1px solid rgba(255,255,255,.08)",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{display:"flex",alignItems:"center",justifyContent:"center",width:24,height:24,borderRadius:7,background:`${color}18`,color,flexShrink:0}}><Icon size={12}/></span>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontSize:13,fontWeight:700,color:"#F0EBE3",margin:0,lineHeight:1.2}}>{stage.label}</p>
            <p style={{fontSize:11,color:"#B5A99B",margin:"1px 0 0"}}>{stage.short}</p>
          </div>
          {isCurrent&&<span style={{fontSize:8,fontWeight:800,color,background:`${color}18`,border:`1px solid ${color}30`,borderRadius:5,padding:"2px 6px",flexShrink:0,letterSpacing:"0.06em"}}>ACTIVE</span>}
        </div>
      </div>
      <div style={{flex:1,padding:"8px 10px 10px",display:"flex",flexDirection:"column",gap:5,minHeight:0}}>
        {placed.length===0?(
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderRadius:9,border:`1px dashed ${color}25`,padding:"10px 12px",textAlign:"center"}}>
            <span style={{display:"flex",alignItems:"center",justifyContent:"center",width:28,height:28,borderRadius:9,background:`${color}12`,marginBottom:8}}><Icon size={13} style={{color:`${color}50`}}/></span>
            <p style={{fontSize:12,color:"#B5A99B",margin:0,lineHeight:1.5}}>{ZONE_PROMPT[stage.id]}</p>
            {canReceive&&<p style={{fontSize:12,color:`${color}`,margin:"8px 0 0",fontWeight:600}}>Click to place {selComp?.name}</p>}
          </div>
        ):(
          <AnimatePresence initial={false}>
            {placed.slice(0,4).map((id)=><PlacedChip key={id} id={id} onRemove={onRemove}/>)}
          </AnimatePresence>
        )}
        {placed.length>4&&<p style={{fontSize:9,color:"rgba(255,255,255,.25)",margin:0,textAlign:"center"}}>+{placed.length-4} more</p>}
      </div>
    </div>
  )
}

function WorkflowCanvas({run,selectedId,onPlace,onRemove,onDeploy,onChangeChallenge}:{
  run:RunState;selectedId:string|null
  onPlace:(id:string,z:string)=>boolean;onRemove:(id:string)=>void;onDeploy:()=>void
  onChangeChallenge:(id:string)=>void
}){
  const active=BUILD_STAGES[STAGE_ORDER.findIndex((z)=>!hasAny(run.placed,z))]??BUILD_STAGES[BUILD_STAGES.length-1]
  const selComp=selectedId?getComponentById(selectedId):null
  const selStage=selComp?BUILD_STAGES.find((s)=>s.id===selComp.zoneId):null
  const selectedGoods=selComp?[selComp.useCase,...(PROS[selComp.id]??[selComp.description]).slice(0,2)]:[]
  const selectedTradeoffs=selComp?[selComp.tradeoffNote,...(CONS[selComp.id]??[]).slice(0,1)].filter(Boolean):[]
  const doneCount=STAGE_ORDER.filter((z)=>hasAny(run.placed,z)).length
  const minMet=hasAny(run.placed,"compute")&&hasAny(run.placed,"data")&&hasAny(run.placed,"security")
  const needsList=["compute","data","security"].filter((z)=>!hasAny(run.placed,z)).map((z)=>BUILD_STAGES.find((s)=>s.id===z)?.label??"")
  const activeColor=ZONE_COLOR[active.id]??"#888"

  const handleCanvasDrop=useCallback((e:React.DragEvent<HTMLDivElement>)=>{
    e.preventDefault();const c=getComponentById(e.dataTransfer.getData("text/plain"));if(c)onPlace(c.id,c.zoneId)
  },[onPlace])

  const row1=BUILD_STAGES.slice(0,3)
  const row2=BUILD_STAGES.slice(3,6)

  return(
    <section style={{display:"flex",flexDirection:"column",height:"100%",background:FORGE_SURFACE.canvas}}>
      {/* Header */}
      <div style={{padding:"10px 18px",borderBottom:"1px solid rgba(255,255,255,.08)",background:FORGE_SURFACE.canvasHeader,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:4,flexWrap:"wrap"}}>
              <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.22em",color:"#E6A23C",textTransform:"uppercase",flexShrink:0}}>Challenge</span>
              <h1 style={{fontSize:16,fontWeight:700,color:"#F0EBE3",margin:0,lineHeight:1.2}}>{run.challenge.title}</h1>
            </div>
            <p style={{fontSize:13,color:"#D5CEC5",margin:0,lineHeight:1.7,maxWidth:640}}>{run.challenge.description}</p>
            {selComp&&(
              <div style={{marginTop:7,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:7,maxWidth:760}}>
                <div style={{background:"rgba(52,211,153,.07)",border:"1px solid rgba(52,211,153,.25)",borderRadius:10,padding:"10px 12px"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:6}}>
                    <p style={{fontSize:10,fontWeight:800,letterSpacing:"0.16em",color:"#34D399",textTransform:"uppercase",margin:0}}>Good</p>
                    <span style={{fontSize:10,color:"#B5A99B",whiteSpace:"nowrap"}}>{selComp.name}</span>
                  </div>
                  {selectedGoods.map((good,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"flex-start",gap:6,marginTop:i===0?0:5}}>
                      <Check size={11} style={{color:"#34D399",flexShrink:0,marginTop:2}}/>
                      <p style={{fontSize:13,color:"#C8BFBA",margin:0,lineHeight:1.5}}>{good}</p>
                    </div>
                  ))}
                </div>
                <div style={{background:"rgba(245,158,11,.07)",border:"1px solid rgba(245,158,11,.28)",borderRadius:10,padding:"10px 12px"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:6}}>
                    <p style={{fontSize:10,fontWeight:800,letterSpacing:"0.16em",color:"#F5C76B",textTransform:"uppercase",margin:0}}>Trade-off</p>
                    <span style={{fontSize:10,color:"#B5A99B",whiteSpace:"nowrap"}}>{selStage?.label??""}</span>
                  </div>
                  {selectedTradeoffs.length>0?selectedTradeoffs.map((tradeoff,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"flex-start",gap:6,marginTop:i===0?0:5}}>
                      <AlertTriangle size={11} style={{color:"#F5C76B",flexShrink:0,marginTop:2}}/>
                      <p style={{fontSize:13,color:"#C8BFBA",margin:0,lineHeight:1.5}}>{tradeoff}</p>
                    </div>
                  )):<p style={{fontSize:13,color:"#C8BFBA",margin:0,lineHeight:1.5}}>No major trade-off called out for this component.</p>}
                </div>
              </div>
            )}
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8,flexShrink:0}}>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"flex-end"}}>
              {run.constraints.map((c)=>(
                <span key={c.id} style={{fontSize:11,fontWeight:600,color:"#C8BFBA",background:"rgba(255,255,255,.09)",border:"1px solid rgba(255,255,255,.18)",borderRadius:8,padding:"5px 12px"}}>{c.label}</span>
              ))}
            </div>
            <button
              onClick={()=>onChangeChallenge(randomRun(run.challenge.id).challenge.id)}
              style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:7,background:"rgba(230,162,60,.12)",border:"1px solid rgba(230,162,60,.35)",cursor:"pointer",fontSize:11,fontWeight:700,color:"#E6A23C",letterSpacing:"0.03em",transition:"all .12s",whiteSpace:"nowrap"}}
              onMouseEnter={(e)=>{const b=e.currentTarget as HTMLButtonElement;b.style.background="rgba(230,162,60,.22)";b.style.borderColor="rgba(230,162,60,.6)"}}
              onMouseLeave={(e)=>{const b=e.currentTarget as HTMLButtonElement;b.style.background="rgba(230,162,60,.12)";b.style.borderColor="rgba(230,162,60,.35)"}}
            ><RotateCcw size={12}/>Change Problem</button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div style={{flex:1,minHeight:0,padding:"10px 14px",display:"flex",flexDirection:"column",gap:8,overflow:"hidden"}}
        onDrop={handleCanvasDrop} onDragOver={(e)=>{e.preventDefault();e.dataTransfer.dropEffect="copy"}}
      >
        {/* Status row */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:8,height:8,borderRadius:99,background:activeColor,boxShadow:`0 0 8px ${activeColor}80`}}/>
            <span style={{fontSize:13,fontWeight:600,color:"#E0D8CE"}}>{active.label}</span>
            <span style={{fontSize:12,color:"#8A8078"}}>{doneCount} / 6 stages</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
            <button onClick={minMet?onDeploy:undefined}
              style={{
                display:"flex",alignItems:"center",gap:8,
                background:minMet?"linear-gradient(135deg,#E6A23C 0%,#C07A1E 100%)":"rgba(255,255,255,.07)",
                border:`1px solid ${minMet?"rgba(230,162,60,.45)":"rgba(255,255,255,.1)"}`,
                borderRadius:10,padding:"9px 22px",cursor:minMet?"pointer":"not-allowed",
                fontFamily:"monospace",fontSize:11,fontWeight:800,letterSpacing:"0.18em",textTransform:"uppercase",
                color:minMet?"#0A0806":"rgba(255,255,255,.22)",
                boxShadow:minMet?"0 12px 32px rgba(230,162,60,.25),inset 0 1px 0 rgba(255,255,255,.18)":undefined,
                transition:"all .15s",
              }}
              onMouseEnter={(e)=>{if(minMet){const b=e.currentTarget as HTMLButtonElement;b.style.transform="translateY(-1px)";b.style.boxShadow="0 16px 40px rgba(230,162,60,.35),inset 0 1px 0 rgba(255,255,255,.2)"}}}
              onMouseLeave={(e)=>{if(minMet){const b=e.currentTarget as HTMLButtonElement;b.style.transform="";b.style.boxShadow="0 12px 32px rgba(230,162,60,.25),inset 0 1px 0 rgba(255,255,255,.18)"}}}
            >SUBMIT SYSTEM</button>
            {!minMet&&needsList.length>0&&<p style={{fontSize:11,color:"#8A8078",margin:0}}>Still needs: {needsList.join(", ")}</p>}
          </div>
        </div>

        {/* Row 1 */}
        <div style={{display:"flex",alignItems:"stretch",gap:0,flex:1,minHeight:0}}>
          {row1.map((stage,idx)=>(
            <div key={stage.id} style={{display:"flex",alignItems:"stretch",flex:1,minWidth:0}}>
              {idx>0&&<HArrow active={hasAny(run.placed,row1[idx-1]!.id)}/>}
              <StageBox stage={stage} placed={run.placed[stage.id]??[]} selectedId={selectedId} isCurrent={active.id===stage.id} onPlace={onPlace} onRemove={onRemove}/>
            </div>
          ))}
        </div>
        <RowConnector active={hasAny(run.placed,"data")}/>
        {/* Row 2 */}
        <div style={{display:"flex",alignItems:"stretch",gap:0,flex:1,minHeight:0}}>
          {row2.map((stage,idx)=>(
            <div key={stage.id} style={{display:"flex",alignItems:"stretch",flex:1,minWidth:0}}>
              {idx>0&&<HArrow active={hasAny(run.placed,row2[idx-1]!.id)}/>}
              <StageBox stage={stage} placed={run.placed[stage.id]??[]} selectedId={selectedId} isCurrent={active.id===stage.id} onPlace={onPlace} onRemove={onRemove}/>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Feedback Panel ───────────────────────────────────────────────────────────

const SCORE_DIM_INFO=[
  {label:"Reliability",    desc:"Can it survive failures and stay up?"},
  {label:"Latency",         desc:"Is it fast enough for real users?"},
  {label:"Scalability",     desc:"Can it grow with demand?"},
  {label:"Security",        desc:"Is it protected against abuse?"},
  {label:"Cost Efficiency", desc:"Is it affordable to actually run?"},
  {label:"Simplicity",      desc:"Can a real team maintain it?"},
]

function FeedbackPanel({placed,constraints}:{placed:PlacedState;constraints:Constraint[]}){
  const warnings =useMemo(()=>getWarnings(placed,cids(constraints)),[placed,constraints])
  const synergies=useMemo(()=>getSynergies(placed),[placed])
  const messages =useMemo(()=>liveMsgs(placed,constraints,warnings,synergies),[placed,constraints,warnings,synergies])
  const count=allIds(placed).length

  const sev=(s:"critical"|"warning"|"info")=>({
    critical:{bg:"rgba(248,113,113,.1)", border:"rgba(248,113,113,.32)",icon:"#F87171",text:"rgba(255,205,205,.95)",I:AlertTriangle},
    warning: {bg:"rgba(245,199,107,.09)",border:"rgba(245,199,107,.32)",icon:"#F5C76B",text:"rgba(255,230,160,.95)",I:AlertTriangle},
    info:    {bg:"rgba(56,189,248,.07)", border:"rgba(56,189,248,.25)", icon:"#38BDF8",text:"rgba(195,233,255,.9)", I:Info},
  })[s]

  return(
    <aside style={{display:"flex",flexDirection:"column",height:"100%",background:FORGE_SURFACE.sidebar,borderLeft:"1px solid rgba(255,255,255,.08)"}}>
      <div style={{padding:"18px 16px 14px",borderBottom:"1px solid rgba(255,255,255,.08)",background:FORGE_SURFACE.sidebarHeader,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:6,height:6,borderRadius:99,background:"#E6A23C",boxShadow:"0 0 8px rgba(230,162,60,.7)"}}/>
            <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.26em",color:"#8A8078",margin:0,textTransform:"uppercase"}}>Feedback</p>
          </div>
          <Sparkles size={13} style={{color:"rgba(255,255,255,.18)"}}/>
        </div>
        <p style={{fontSize:13,color:"#B5A99B",margin:0,lineHeight:1.6}}>Real-time engineering review. Score stays hidden until you submit.</p>
      </div>

      <div style={{flex:1,overflowY:"auto",overflowX:"hidden",padding:12,display:"flex",flexDirection:"column",gap:8}}>
        {count===0?(
          <div>
            <div style={{background:FORGE_SURFACE.card,border:"1px solid rgba(255,255,255,.1)",borderRadius:12,padding:16,marginBottom:10}}>
              <p style={{fontSize:13,fontWeight:600,color:"#E0D8CE",margin:"0 0 14px"}}>Your design gets scored on 6 things:</p>
              <div style={{display:"flex",flexDirection:"column",gap:11}}>
                {SCORE_DIM_INFO.map((d)=>(
                  <div key={d.label} style={{display:"flex",alignItems:"flex-start",gap:9}}>
                    <span style={{width:4,height:4,borderRadius:99,background:"#E6A23C",flexShrink:0,marginTop:7}}/>
                    <div>
                      <p style={{fontSize:13,fontWeight:600,color:"#E0D8CE",margin:0}}>{d.label}</p>
                      <p style={{fontSize:12,color:"#B5A99B",margin:0,lineHeight:1.5}}>{d.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:"rgba(248,113,113,.04)",border:"1px solid rgba(248,113,113,.14)",borderRadius:10,padding:"10px 12px"}}>
              <p style={{fontSize:13,color:"rgba(255,185,185,.85)",margin:0,lineHeight:1.6}}>Skip key layers and the score will show it. Over-engineer and it will too.</p>
            </div>
          </div>
        ):messages.map((msg,i)=>{
          const {bg,border,icon,text,I}=sev(msg.severity)
          return(
            <motion.div key={`${msg.message}-${i}`} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{duration:.18,delay:i*.03}}
              style={{background:bg,border:`1px solid ${border}`,borderRadius:10,padding:"10px 12px",display:"flex",gap:9}}
            >
              <I size={13} style={{color:icon,flexShrink:0,marginTop:2}}/>
              <p style={{fontSize:13,color:text,margin:0,lineHeight:1.7}}>{msg.message}</p>
            </motion.div>
          )
        })}
      </div>
    </aside>
  )
}

// ─── Design Feedback Overlay ──────────────────────────────────────────────────

function ScoreMeter({label,value,of100}:{label:string;value:number;of100?:boolean}){
  const pct=of100?value:Math.round(value*10)
  const color=pct>=75?"#34D399":pct>=50?"#FBBF24":"#F87171"
  return(
    <div style={{marginBottom:5}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
        <span style={{fontSize:11,color:"#B5A99B",fontWeight:500}}>{label}</span>
        <span style={{fontSize:11,color:"#D8D0C4",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>
          {of100?value:value.toFixed(1)}<span style={{color:"#8A8078",fontWeight:400}}>{of100?" / 100":" / 10"}</span>
        </span>
      </div>
      <div style={{height:3,background:"rgba(255,255,255,.07)",borderRadius:99,overflow:"hidden"}}>
        <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:.6,ease:"easeOut"}}
          style={{height:"100%",background:color,borderRadius:99,boxShadow:`0 0 8px ${color}50`}}/>
      </div>
    </div>
  )
}

function Accordion({title,icon,defaultOpen=false,children}:{title:string;icon:React.ReactNode;defaultOpen?:boolean;children:React.ReactNode}){
  const [open,setOpen]=useState(defaultOpen)
  return(
    <div style={{background:FORGE_SURFACE.card,border:"1px solid rgba(255,255,255,.1)",borderRadius:9,overflow:"hidden",flexShrink:0}}>
      <button onClick={()=>setOpen(!open)} style={{width:"100%",display:"flex",alignItems:"center",gap:7,padding:"8px 12px",background:"transparent",border:"none",cursor:"pointer"}}>
        {icon}
        <p style={{flex:1,fontSize:12,fontWeight:600,color:"#E0D8CE",margin:0,textAlign:"left"}}>{title}</p>
        {open?<ChevronDown size={14} style={{color:"rgba(255,255,255,.3)"}}/>:<ChevronRight size={14} style={{color:"rgba(255,255,255,.22)"}}/>}
      </button>
      {open&&<div style={{padding:"0 12px 10px"}}>{children}</div>}
    </div>
  )
}

function DesignComparisonZone({zone,run,cidArr}:{zone:(typeof ZONES)[number];run:RunState;cidArr:string[]}){
  const yours=run.placed[zone.id]??[], mine=run.challenge.solution.placed[zone.id]??[]
  const allC=Array.from(new Set([...mine,...yours]))
  if(!allC.length&&!zone.required)return null

  const color=ZONE_COLOR[zone.id]??"#888"
  const Icon=ZONE_ICON[zone.id]??CircleDot
  const zoneExact=mine.length>0&&mine.every((id)=>yours.includes(id))&&yours.every((id)=>mine.includes(id))

  return(
    <div style={{height:"100%",display:"flex",flexDirection:"column",borderRadius:9,border:`1px solid ${zoneExact?"rgba(52,211,153,.22)":"rgba(255,255,255,.09)"}`,background:zoneExact?"rgba(52,211,153,.04)":"rgba(255,255,255,.02)",overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 8px",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
        <span style={{display:"flex",alignItems:"center",justifyContent:"center",width:17,height:17,borderRadius:5,background:`${color}18`,color,flexShrink:0}}>
          <Icon size={9}/>
        </span>
        <p style={{flex:1,fontSize:11,fontWeight:700,color:"#C8BFBA",margin:0,textTransform:"uppercase",letterSpacing:"0.1em",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",textAlign:"left"}}>{zone.label}</p>
        {zoneExact&&<Check size={12} style={{color:"#34D399",flexShrink:0}}/>}
      </div>

      <div style={{flex:1,minHeight:0,padding:"5px 7px 7px",display:"flex",flexDirection:"column",gap:3,overflowY:"auto"}}>
          {allC.length===0?(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,paddingTop:2}}>
              <div><p style={{fontSize:9,color:"#8A8078",margin:"0 0 2px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em"}}>You</p><p style={{fontSize:11,fontWeight:600,color:"#8A8078",margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>Nothing placed</p></div>
              <div><p style={{fontSize:9,color:"#8A8078",margin:"0 0 2px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em"}}>Me</p><p style={{fontSize:11,fontWeight:600,color:"#8A8078",margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{mine.map((id)=>getComponentById(id)?.name).filter(Boolean).join(", ")||"Nothing"}</p></div>
            </div>
          ):allC.map((id)=>{
            const yc=yours.includes(id)?getComponentById(id):undefined
            const mc=mine.includes(id)?getComponentById(id):undefined
            const q=classifyMatchQuality(yc?.id??yours[0],mc?.id??(mine.find((m)=>!yours.includes(m))??mine[0]),cidArr)
            const qs=MATCH_STYLE[q]
            return(
              <div key={id} style={{borderRadius:7,border:`1px solid ${qs.border}`,background:qs.bg,padding:"4px 6px"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  <div>
                    <p style={{fontSize:9,color:"#8A8078",margin:"0 0 2px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em"}}>You</p>
                    <p style={{fontSize:11,fontWeight:600,color:yc?"#E0D8CE":"#8A8078",margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{yc?.name??"Nothing placed"}</p>
                  </div>
                  <div>
                    <p style={{fontSize:9,color:"#8A8078",margin:"0 0 2px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em"}}>Me</p>
                    <p style={{fontSize:11,fontWeight:600,color:mc?"#E0D8CE":"#8A8078",margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{mc?.name ?? (mine.map((i2)=>getComponentById(i2)?.name).filter(Boolean).join(" + ") || "Nothing")}</p>
                  </div>
                </div>
                <span style={{display:"inline-block",fontSize:7,fontWeight:800,color:qs.text,border:`1px solid ${qs.border}`,borderRadius:4,padding:"1px 4px",marginTop:3}}>{MATCH_LABEL[q]}</span>
              </div>
            )
          })}
      </div>
    </div>
  )
}

function DesignFeedbackOverlay({run,onRetry,onClose}:{run:RunState;onRetry:()=>void;onClose:()=>void}){
  const warnings  =useMemo(()=>getWarnings(run.placed,cids(run.constraints)),[run])
  const synergies =useMemo(()=>getSynergies(run.placed),[run])
  const scores    =useMemo(()=>adjustedScores(run.placed,run.constraints),[run])
  const {finalScore:fs,architectureScore:as,solutionMatchScore:sm,coverageScore:cv,constraintFitScore:cf}=useMemo(()=>computeFS(run),[run])
  const readiness =readinessScore(run.placed,warnings,run.constraints)
  const t         =scoreTier(fs,scores)
  const tc        =tierColor(fs)
  const verdict   =buildVerdict(fs,scores,run)
  const expl      =buildExplanation(run,{finalScore:fs,solutionMatchScore:sm,coverageScore:cv,architectureScore:as})
  const risks     =missingRisks(run.placed,run.constraints)
  const decisions =bestDecisions(run.placed,synergies)
  const bp        =breaksFirst(run.placed,run.constraints,scores)
  const failures  =useMemo(()=>failureSimulation(run),[run])
  const suggestions=useMemo(()=>improveSuggestions(run),[run])
  const maxGain   =suggestions.reduce((s,x)=>s+x.gain,0)
  const cidArr    =cids(run.constraints)
  const ev:Evaluation={scores,finalScore:fs,architectureScore:as,solutionMatchScore:sm,coverageScore:cv,constraintFitScore:cf,readiness,tier:t,warnings,synergies,risks,decisions,breakPoint:bp,scoreExplanation:expl}

  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      style={{position:"fixed",inset:0,zIndex:70,overflow:"hidden",padding:6,background:"rgba(3,2,1,.92)",backdropFilter:"blur(24px)"}}
    >
      <motion.div initial={{opacity:0,y:32,scale:.97}} animate={{opacity:1,y:0,scale:1}} transition={{type:"spring",stiffness:300,damping:30}}
        style={{width:"calc(100vw - 12px)",height:"calc(100dvh - 12px)",margin:"0 auto",borderRadius:16,overflow:"hidden",background:FORGE_SURFACE.overlayPanel,border:"1px solid rgba(255,255,255,.1)",boxShadow:"0 48px 120px rgba(0,0,0,.8),inset 0 1px 0 rgba(255,255,255,.06)"}}
      >
        <div style={{display:"grid",gridTemplateColumns:"300px minmax(0,1fr) 280px",height:"100%",background:"rgba(255,255,255,.05)",gap:1}}>
          {/* Result */}
          <section style={{background:`linear-gradient(180deg,rgba(255,255,255,.02),rgba(255,255,255,0)), ${FORGE_SURFACE.overlay}`,padding:"12px 14px",display:"flex",flexDirection:"column",gap:8,minWidth:0,overflowY:"auto"}}>
            <p style={{fontSize:9,fontWeight:800,letterSpacing:"0.28em",color:"#8A8078",textTransform:"uppercase",margin:"0 0 8px"}}>Design Feedback</p>
            <div style={{display:"flex",alignItems:"flex-end",gap:8,marginBottom:8}}>
              <p style={{fontSize:66,fontWeight:900,color:"#F0EBE3",margin:0,lineHeight:.9,letterSpacing:"-0.04em"}}>{fs}</p>
              <div style={{paddingBottom:5}}>
                <p style={{fontSize:12,color:"#8A8078",margin:"0 0 4px"}}>/ 100</p>
                <p style={{fontSize:18,fontWeight:800,color:tc,margin:0,lineHeight:1.15}}>{t}</p>
              </div>
            </div>

            <div style={{background:"rgba(245,158,11,.05)",border:"1px solid rgba(245,158,11,.2)",borderRadius:9,padding:"8px 11px",flexShrink:0}}>
              <p style={{fontSize:9,fontWeight:800,letterSpacing:"0.18em",color:"#F5C76B",textTransform:"uppercase",margin:"0 0 5px"}}>Senior verdict</p>
              <p style={{fontSize:12,color:"rgba(255,235,190,.92)",margin:0,lineHeight:1.55}}>{verdict}</p>
            </div>

            <p style={{fontSize:11,color:"#C8BFBA",margin:0,lineHeight:1.6,flexShrink:0}}>{expl}</p>

            <div style={{background:FORGE_SURFACE.card,border:"1px solid rgba(255,255,255,.1)",borderRadius:10,overflow:"hidden",flexShrink:0}}>
              <div style={{display:"flex",alignItems:"center",gap:7,padding:"8px 12px",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
                <Sparkles size={12} style={{color:"rgba(255,255,255,.35)"}}/>
                <p style={{flex:1,fontSize:12,fontWeight:600,color:"#E0D8CE",margin:0}}>Score Breakdown</p>
              </div>
              <div style={{padding:"8px 12px 10px"}}>
                <ScoreMeter label="Architecture Quality" value={as} of100/>
                <ScoreMeter label="Solution Match" value={sm} of100/>
                <ScoreMeter label="Coverage" value={cv} of100/>
                <ScoreMeter label="Constraint Fit" value={cf} of100/>
                <div style={{height:1,background:"rgba(255,255,255,.07)",margin:"10px 0"}}/>
                {SCORE_KEYS.map((k)=><ScoreMeter key={k} label={k==="cost"?"Cost Efficiency":SCORE_LABELS[k]} value={scores[k]}/>)}
                <ScoreMeter label="Production Readiness" value={readiness}/>
              </div>
            </div>

            {suggestions.length>0&&(
              <Accordion title={`Improve Score: +${maxGain} pts possible`} icon={<TrendingUp size={14} style={{color:"#FBBF24"}}/>} defaultOpen>
                <div style={{paddingTop:4,display:"flex",flexDirection:"column",gap:8}}>
                  {suggestions.map((s,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,background:"rgba(245,158,11,.04)",border:"1px solid rgba(245,158,11,.14)",borderRadius:7,padding:"6px 9px"}}>
                      <div style={{background:"rgba(245,158,11,.14)",borderRadius:5,padding:"1px 6px",flexShrink:0}}>
                        <p style={{fontSize:10,fontWeight:800,color:"#FBBF24",margin:0}}>+{s.gain}</p>
                      </div>
                      <div>
                        <p style={{fontSize:11,fontWeight:600,color:"rgba(255,225,150,.92)",margin:"0 0 2px"}}>{s.component}</p>
                        <p style={{fontSize:10,color:"#B5A99B",margin:0}}>{s.why}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Accordion>
            )}

            <div style={{flex:1}}/>
            <Accordion title="Strongest Decisions" icon={<Sparkles size={14} style={{color:"#FBBF24"}}/>} defaultOpen>
              <div style={{paddingTop:6,display:"flex",flexDirection:"column",gap:5}}>
                {decisions.length?decisions.map((d,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:7}}>
                    <span style={{width:3,height:3,borderRadius:99,background:"#FBBF24",flexShrink:0,marginTop:7}}/>
                    <p style={{fontSize:13,color:"rgba(255,225,150,.9)",margin:0,lineHeight:1.5}}>{d}</p>
                  </div>
                )):<p style={{fontSize:12,color:"rgba(200,180,100,.55)",margin:"4px 0 0"}}>Add more components to see strong decisions.</p>}
              </div>
            </Accordion>
          </section>

          {/* Architecture */}
          <section style={{background:FORGE_SURFACE.overlay,padding:"12px 14px",display:"flex",flexDirection:"column",gap:9,minHeight:0,overflowY:"auto"}}>
            <div style={{background:FORGE_SURFACE.card,border:"1px solid rgba(255,255,255,.1)",borderRadius:12,overflow:"hidden",flex:1,minHeight:0,display:"flex",flexDirection:"column"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
                <Check size={14} style={{color:"rgba(255,255,255,.4)"}}/>
                <p style={{flex:1,fontSize:13,fontWeight:600,color:"#E0D8CE",margin:0}}>My Design vs Recommended Architecture</p>
              </div>
              <div style={{flex:1,minHeight:0,padding:10,display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gridAutoRows:"minmax(100px,1fr)",gap:6,alignContent:"start",overflowY:"auto"}}>
                {ZONES.map((zone)=><DesignComparisonZone key={zone.id} zone={zone} run={run} cidArr={cidArr}/>)}
              </div>
            </div>
          </section>

          {/* Insights */}
          <section style={{background:FORGE_SURFACE.overlay,padding:"12px 14px",display:"flex",flexDirection:"column",gap:9,minHeight:0,overflowY:"auto"}}>
            <div style={{background:FORGE_SURFACE.card,border:"1px solid rgba(255,255,255,.1)",borderRadius:12,overflow:"hidden",flex:"1 1 0",minHeight:0,display:"flex",flexDirection:"column"}}>
              <div style={{display:"flex",alignItems:"center",gap:7,padding:"8px 12px",borderBottom:"1px solid rgba(255,255,255,.07)",flexShrink:0}}>
                <AlertTriangle size={13} style={{color:"#F87171"}}/>
                <p style={{flex:1,fontSize:12,fontWeight:700,color:"#E0D8CE",margin:0}}>Biggest Risks</p>
              </div>
              <div style={{flex:1,padding:"8px 10px",display:"flex",flexDirection:"column",gap:5,overflowY:"auto"}}>
                {risks.slice(0,4).map((r,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:7,background:"rgba(248,113,113,.07)",border:"1px solid rgba(248,113,113,.22)",borderRadius:7,padding:"6px 9px",flexShrink:0}}>
                    <span style={{width:4,height:4,borderRadius:99,background:"#F87171",flexShrink:0,marginTop:6}}/>
                    <p style={{fontSize:11,color:"rgba(255,205,200,.92)",margin:0,lineHeight:1.5}}>{r}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{background:FORGE_SURFACE.card,border:"1px solid rgba(255,255,255,.1)",borderRadius:12,overflow:"hidden",flex:"1.3 1 0",minHeight:0,display:"flex",flexDirection:"column"}}>
              <div style={{display:"flex",alignItems:"center",gap:7,padding:"8px 12px",borderBottom:"1px solid rgba(255,255,255,.07)",flexShrink:0}}>
                <AlertTriangle size={13} style={{color:"#F87171"}}/>
                <p style={{flex:1,fontSize:12,fontWeight:700,color:"#E0D8CE",margin:0}}>Under 10x Traffic Load</p>
              </div>
              <div style={{flex:1,padding:"8px 10px",display:"flex",flexDirection:"column",gap:7,overflowY:"auto"}}>
                {failures.slice(0,2).map((f,i)=>(
                  <div key={i} style={{background:"rgba(248,113,113,.07)",border:"1px solid rgba(248,113,113,.22)",borderRadius:8,padding:"8px 10px",flexShrink:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5,flexWrap:"wrap"}}>
                      <span style={{fontSize:9,fontWeight:800,color:"#F87171",background:"rgba(248,113,113,.14)",border:"1px solid rgba(248,113,113,.28)",borderRadius:4,padding:"1px 6px",letterSpacing:"0.04em"}}>{f.trigger}</span>
                      <p style={{fontSize:10,color:"#B5A99B",margin:0}}>Bottleneck: {f.bottleneck}</p>
                    </div>
                    <p style={{fontSize:11,color:"rgba(255,205,200,.92)",margin:"0 0 6px",lineHeight:1.5}}>{f.what}</p>
                    <div style={{display:"flex",alignItems:"flex-start",gap:6}}>
                      <Check size={11} style={{color:"#34D399",flexShrink:0,marginTop:2}}/>
                      <p style={{fontSize:11,color:"rgba(160,235,200,.88)",margin:0,lineHeight:1.45}}>Fix: {f.fix}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{background:FORGE_SURFACE.card,border:"1px solid rgba(255,255,255,.1)",borderRadius:12,overflow:"hidden",flex:"0 0 auto",minHeight:0}}>
              <div style={{display:"flex",alignItems:"center",gap:7,padding:"8px 12px",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
                <Zap size={12} style={{color:"#FBBF24"}}/>
                <p style={{flex:1,fontSize:12,fontWeight:700,color:"#E0D8CE",margin:0}}>What Breaks First?</p>
              </div>
              <div style={{padding:"8px 12px"}}>
                <p style={{fontSize:11,color:"#C8BFBA",margin:0,lineHeight:1.6}}>{bp}</p>
              </div>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:6,alignSelf:"stretch",flexShrink:0}}>
              <button onClick={()=>downloadReport(run,ev)}
                style={{display:"flex",alignItems:"center",justifyContent:"center",gap:7,background:"linear-gradient(135deg,#E6A23C 0%,#C07A1E 100%)",border:"1px solid rgba(230,162,60,.45)",borderRadius:7,padding:"8px 12px",cursor:"pointer",fontFamily:"monospace",fontSize:10,fontWeight:800,letterSpacing:"0.14em",textTransform:"uppercase",color:"#0A0806",boxShadow:"0 8px 24px rgba(230,162,60,.2),inset 0 1px 0 rgba(255,255,255,.18)",transition:"all .15s"}}
                onMouseEnter={(e)=>{const b=e.currentTarget as HTMLButtonElement;b.style.transform="translateY(-1px)";b.style.boxShadow="0 16px 40px rgba(230,162,60,.35),inset 0 1px 0 rgba(255,255,255,.2)"}}
                onMouseLeave={(e)=>{const b=e.currentTarget as HTMLButtonElement;b.style.transform="";b.style.boxShadow="0 12px 32px rgba(230,162,60,.25),inset 0 1px 0 rgba(255,255,255,.18)"}}
              ><Download size={14}/> Download Report</button>
              <button onClick={onRetry}
                style={{display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"7px 12px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:600,color:"rgba(240,235,227,.5)",transition:"all .15s"}}
                onMouseEnter={(e)=>{const b=e.currentTarget as HTMLButtonElement;b.style.background="rgba(255,255,255,.1)";b.style.color="rgba(255,255,255,.85)"}}
                onMouseLeave={(e)=>{const b=e.currentTarget as HTMLButtonElement;b.style.background="rgba(255,255,255,.06)";b.style.color="rgba(255,255,255,.55)"}}
              ><RotateCcw size={13}/> New Run</button>
              <button onClick={onClose}
                style={{display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"7px 12px",background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",borderRadius:7,cursor:"pointer",color:"rgba(240,235,227,.38)",fontSize:11,fontWeight:600,transition:"all .15s"}}
                onMouseEnter={(e)=>{const b=e.currentTarget as HTMLButtonElement;b.style.color="rgba(255,255,255,.8)";b.style.background="rgba(255,255,255,.08)"}}
                onMouseLeave={(e)=>{const b=e.currentTarget as HTMLButtonElement;b.style.color="rgba(255,255,255,.42)";b.style.background="rgba(255,255,255,.04)"}}
              ><X size={13}/> Cancel</button>
            </div>
          </section>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function ForgeGame(){
  const [phase,setPhase]=useState<GamePhase>("building")
  const [run,setRun]    =useState<RunState>(()=>createRun())
  const [selId,setSelId]=useState<string|null>(null)
  const [,setDragId]    =useState<string|null>(null)

  const handlePlace=useCallback((componentId:string,zoneId:string)=>{
    const comp=getComponentById(componentId),zone=ZONES.find((z)=>z.id===zoneId)
    if(!comp||!zone||comp.zoneId!==zoneId)return false
    let placed=false
    setRun((prev)=>{
      const arr=prev.placed[zoneId]??[]
      if(allIds(prev.placed).includes(componentId)||arr.length>=zone.maxSlots)return prev
      placed=true;return{...prev,placed:{...prev.placed,[zoneId]:[...arr,componentId]}}
    })
    if(placed){setSelId(null);setDragId(null)}
    return placed
  },[])

  const handleRemove=useCallback((componentId:string)=>{
    const c=getComponentById(componentId);if(!c)return
    setRun((prev)=>({...prev,placed:{...prev.placed,[c.zoneId]:(prev.placed[c.zoneId]??[]).filter((id)=>id!==componentId)}}))
  },[])

  const handleRetry=useCallback(()=>{
    setRun(randomRun(run.challenge.id));setSelId(null);setDragId(null);setPhase("building")
  },[run.challenge.id])

  const handleChangeChallenge=useCallback((id:string)=>{
    setRun(createRun(id));setSelId(null);setDragId(null);setPhase("building")
  },[])

  return(
    <div style={{margin:"-24px -32px -48px",background:FORGE_SURFACE.page,color:"#E0D8CE"}}
      className="min-h-[calc(100vh-56px)] lg:-mx-16 lg:h-[calc(100vh-3.5rem)] lg:overflow-hidden"
    >
      <div className="hidden h-full min-h-0 lg:grid" style={{gridTemplateColumns:"308px minmax(0,1fr) 308px"}}>
        <div className="min-h-0"><ComponentLibrary placed={run.placed} selectedId={selId} onSelect={setSelId} onDragStart={setDragId}/></div>
        <div className="min-h-0"><WorkflowCanvas run={run} selectedId={selId} onPlace={handlePlace} onRemove={handleRemove} onDeploy={()=>setPhase("complete")} onChangeChallenge={handleChangeChallenge}/></div>
        <div className="min-h-0"><FeedbackPanel placed={run.placed} constraints={run.constraints}/></div>
      </div>

      <div className="space-y-3 p-3 pb-10 lg:hidden">
        <div style={{minHeight:520,borderRadius:16,border:"1px solid rgba(255,255,255,.08)",overflow:"hidden"}}>
          <WorkflowCanvas run={run} selectedId={selId} onPlace={handlePlace} onRemove={handleRemove} onDeploy={()=>setPhase("complete")} onChangeChallenge={handleChangeChallenge}/>
        </div>
        <div style={{height:"60vh",overflow:"hidden",borderRadius:16,border:"1px solid rgba(255,255,255,.08)"}}>
          <ComponentLibrary placed={run.placed} selectedId={selId} onSelect={setSelId} onDragStart={setDragId}/>
        </div>
        <div style={{height:"42vh",overflow:"hidden",borderRadius:16,border:"1px solid rgba(255,255,255,.08)"}}>
          <FeedbackPanel placed={run.placed} constraints={run.constraints}/>
        </div>
      </div>

      <AnimatePresence>
        {phase==="complete"&&<DesignFeedbackOverlay run={run} onRetry={handleRetry} onClose={()=>setPhase("building")}/>}
      </AnimatePresence>
    </div>
  )
}
