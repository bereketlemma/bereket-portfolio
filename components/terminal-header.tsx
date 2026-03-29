export function TerminalHeader({ filename }: { filename: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-border/30 px-4 py-2">
      <span className="h-2 w-2 rounded-full bg-red-500/70" aria-hidden="true" />
      <span className="h-2 w-2 rounded-full bg-yellow-500/70" aria-hidden="true" />
      <span className="h-2 w-2 rounded-full bg-green-500/70" aria-hidden="true" />
      <span className="ml-2 font-mono text-[10px] text-muted-foreground/50">{filename}</span>
    </div>
  )
}
