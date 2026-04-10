"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { Check, CircleDotDashed, Clock3 } from "lucide-react"
import { motion } from "framer-motion"

type TimelineSize = "sm" | "md" | "lg"
type TimelineIconSize = "sm" | "md" | "lg"
type TimelineStatus = "completed" | "in-progress" | "pending"
type TimelineIconColor = "primary" | "secondary" | "muted" | "accent"

type TimelineProps = {
  children: ReactNode
  size?: TimelineSize
  iconsize?: TimelineIconSize
}

type TimelineItemProps = {
  date: Date | string | number
  title: string
  description: string
  icon?: ReactNode
  iconColor?: TimelineIconColor
  status?: TimelineStatus
  loading?: boolean
  error?: string
  hideDate?: boolean
  hideStatus?: boolean
  isLast?: boolean
  animationIndex?: number
}

type TimelineTimeProps = {
  date: Date | string | number
  format?: string | Intl.DateTimeFormatOptions
  className?: string
}

type TimelineContextValue = {
  size: TimelineSize
  iconsize: TimelineIconSize
}

const TimelineContext = createContext<TimelineContextValue>({ size: "md", iconsize: "md" })

function cn(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ")
}

function itemSpacing(size: TimelineSize) {
  if (size === "sm") return "gap-4"
  if (size === "lg") return "gap-8"
  return "gap-6"
}

function textScale(size: TimelineSize) {
  if (size === "sm") return "text-xs"
  if (size === "lg") return "text-base"
  return "text-sm"
}

function titleScale(size: TimelineSize) {
  if (size === "sm") return "text-sm"
  if (size === "lg") return "text-lg sm:text-xl"
  return "text-base sm:text-lg"
}

function iconBoxSize(iconSize: TimelineIconSize) {
  if (iconSize === "sm") return "h-7 w-7"
  if (iconSize === "lg") return "h-11 w-11"
  return "h-9 w-9"
}

function iconPixel(iconSize: TimelineIconSize) {
  if (iconSize === "sm") return 14
  if (iconSize === "lg") return 20
  return 16
}

function iconTone(iconColor: TimelineIconColor) {
  if (iconColor === "secondary") return "border-secondary/45 text-secondary"
  if (iconColor === "muted") return "border-muted-foreground/45 text-muted-foreground"
  if (iconColor === "accent") return "border-accent/45 text-accent"
  return "border-primary/45 text-primary"
}

function statusDefaultIcon(status: TimelineStatus, size: number) {
  if (status === "in-progress") return <CircleDotDashed size={size} />
  if (status === "pending") return <Clock3 size={size} />
  return <Check size={size} />
}

function statusBadge(status: TimelineStatus) {
  if (status === "in-progress") return "in progress"
  if (status === "pending") return "pending"
  return "completed"
}

function renderDescriptionLines(description: string) {
  const lines = description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) {
    return <p className="leading-7 text-foreground/90">{description}</p>
  }

  return (
    <div className="space-y-1.5 break-words leading-7">
      {lines.map((line, index) => {
        if (line.startsWith("Tradeoff:")) {
          const detail = line.replace("Tradeoff:", "").trim()

          return (
            <p key={`desc-${index}`} className="text-foreground/90">
              <span className="text-accent">Tradeoff:</span>{" "}
              {detail}
            </p>
          )
        }

        if (line.startsWith("Reason:")) {
          return (
            <p key={`desc-${index}`} className="text-foreground/90">
              {line}
            </p>
          )
        }

        if (line.startsWith("Next:")) {
          return (
            <p key={`desc-${index}`} className="text-secondary">
              {line}
            </p>
          )
        }

        return (
          <p key={`desc-${index}`} className="text-foreground/90">
            {line}
          </p>
        )
      })}
    </div>
  )
}

export function Timeline({ children, size = "md", iconsize = "md" }: TimelineProps) {
  const value = useMemo(() => ({ size, iconsize }), [size, iconsize])

  return (
    <TimelineContext.Provider value={value}>
      <ol className={cn("relative", itemSpacing(size))}>{children}</ol>
    </TimelineContext.Provider>
  )
}

export function TimelineItem({
  date,
  title,
  description,
  icon,
  iconColor = "primary",
  status = "completed",
  loading = false,
  error,
  hideDate = false,
  hideStatus = false,
  isLast = false,
  animationIndex = 0,
}: TimelineItemProps) {
  const { size, iconsize } = useContext(TimelineContext)
  const iconSize = iconPixel(iconsize)

  return (
    <motion.li
      className="relative pl-12 sm:pl-14 md:pl-16"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: Math.min(animationIndex * 0.06, 0.45) }}
    >
      {!isLast && (
        <span className="timeline-connector absolute left-[0.95rem] top-10 h-[calc(100%+1rem)] w-px" aria-hidden />
      )}

      <motion.div
        className={cn(
          "timeline-node absolute left-0 top-0 inline-flex items-center justify-center rounded-full border bg-background/85",
          iconBoxSize(iconsize),
          iconTone(iconColor)
        )}
        whileHover={{ scale: 1.08 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        {loading ? <CircleDotDashed size={iconSize} className="animate-spin" /> : icon ?? statusDefaultIcon(status, iconSize)}
      </motion.div>

      <motion.div
        className={cn("timeline-panel min-w-0 space-y-1", textScale(size))}
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 240, damping: 20 }}
      >
        {(!hideDate || !hideStatus) && (
          <div className="flex flex-wrap items-center gap-2">
            {!hideDate && (
              <TimelineTime date={date} className="font-mono text-[11px] uppercase tracking-[0.11em] text-muted-foreground" />
            )}
            {!hideStatus && (
              <span className="rounded-full border border-border/70 bg-card/70 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-accent">
                {statusBadge(status)}
              </span>
            )}
          </div>
        )}

        <h3 className={cn("break-words font-syne font-bold text-foreground", titleScale(size))}>{title}</h3>

        {!error ? (
          renderDescriptionLines(description)
        ) : (
          <p className="leading-7 text-destructive">{error}</p>
        )}
      </motion.div>
    </motion.li>
  )
}

export function TimelineTime({ date, format, className }: TimelineTimeProps) {
  const [display, setDisplay] = useState("")

  useEffect(() => {
    const raw = String(date)
    const parsed = new Date(date)

    if (Number.isNaN(parsed.getTime())) {
      // Fallback to raw text for labels such as "Step 1".
      setDisplay(raw)
      return
    }

    if (typeof format === "string") {
      setDisplay(new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(parsed))
      return
    }

    if (format) {
      setDisplay(new Intl.DateTimeFormat(undefined, format).format(parsed))
      return
    }

    setDisplay(new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(parsed))
  }, [date, format])

  return <time className={className}>{display || "..."}</time>
}
