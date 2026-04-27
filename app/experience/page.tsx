import { redirect } from "next/navigation"

type Props = { searchParams: { tab?: string } }

export default function ExperiencePage({ searchParams }: Props) {
  const tab = searchParams.tab
  redirect(tab ? `/?section=experience&tab=${tab}` : "/?section=experience")
}
