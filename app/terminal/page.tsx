import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = { title: "Terminal" }

export default function TerminalPage() {
  redirect("/?section=terminal")
}
