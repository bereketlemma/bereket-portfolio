export default function Footer() {
  return (
    <footer className="py-12 border-t border-border/40">
      <div className="flex flex-col items-center gap-2">
        <p className="font-mono text-xs text-muted-foreground">
          <span className="text-accent">bereket@lemma:~$</span> built with Next.js + Firebase
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          © {new Date().getFullYear()} Bereket Lemma — bereketlemma.com
        </p>
      </div>
    </footer>
  )
}