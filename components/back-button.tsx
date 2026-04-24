"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

type Props = {
  section: string
  label: string
  className?: string
}

export function BackButton({ section, label, className }: Props) {
  const router = useRouter()

  function handleClick() {
    sessionStorage.setItem("homeScrollPosition", section)
    router.push("/")
  }

  return (
    <button onClick={handleClick} className={className}>
      <ArrowLeft size={14} />
      {label}
    </button>
  )
}
