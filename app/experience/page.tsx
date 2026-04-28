import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = { title: "Experience" }

type Props = { searchParams: { tab?: string } }

export default function ExperiencePage({ searchParams }: Props) {
  const tab = searchParams.tab
  redirect(tab ? `/?section=experience&tab=${tab}` : "/?section=experience")
}
