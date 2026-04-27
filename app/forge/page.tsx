import type { Metadata } from "next"
import ForgeGame from "./_components/forge-game"

export const metadata: Metadata = {
  title: "Forge — Bereket Lemma",
  description:
    "An interactive system design challenge. Build the architecture, make the tradeoffs, see how it scores.",
}

export default function ForgePage() {
  return <ForgeGame />
}
