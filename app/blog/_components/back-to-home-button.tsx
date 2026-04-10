"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function BackToHomeButton() {
  const router = useRouter()

  const handleBackHome = () => {
    sessionStorage.setItem("homeScrollPosition", "blog")

    const referrer = document.referrer
    const canUseHistoryBack =
      !!referrer &&
      new URL(referrer).origin === window.location.origin &&
      window.history.length > 1

    if (canUseHistoryBack) {
      router.back()
      return
    }

    router.push("/#blog")
  }

  return (
    <button
      type="button"
      onClick={handleBackHome}
      className="mb-10 inline-flex items-center gap-2 rounded border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:border-accent hover:text-accent transition-all"
    >
      <ArrowLeft size={14} />
      back to home
    </button>
  )
}