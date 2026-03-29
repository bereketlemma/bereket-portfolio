export default function Footer() {
  return (
    <footer className="mt-20 border-t border-border/40 py-8">
      <div className="flex flex-col items-center gap-2">
        <p className="font-mono text-xs text-muted-foreground">
          <span className="text-accent">bereket@lemma:~$</span> built with Next.js · TypeScript · Tailwind
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          © {new Date().getFullYear()} Bereket Lemma
        </p>
      </div>
    </footer>
  )
}