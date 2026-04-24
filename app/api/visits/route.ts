import { NextResponse } from "next/server"

const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID
const API_KEY    = process.env.NEXT_PUBLIC_API_KEY
const DOC_PATH   = `projects/${PROJECT_ID}/databases/(default)/documents/stats/visits`
const BASE_URL   = `https://firestore.googleapis.com/v1/${DOC_PATH}`

async function increment() {
  await fetch(`https://firestore.googleapis.com/v1/${DOC_PATH.replace("stats/visits", "")}:commit?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      writes: [{
        transform: {
          document: DOC_PATH,
          fieldTransforms: [{
            fieldPath: "count",
            increment: { integerValue: "1" },
          }],
        },
      }],
    }),
    cache: "no-store",
  })
}

async function getCount(): Promise<number | null> {
  const res = await fetch(`${BASE_URL}?key=${API_KEY}`, { cache: "no-store" })
  if (!res.ok) return null
  const data = await res.json()
  const val = data?.fields?.count?.integerValue
  return val != null ? parseInt(val, 10) : null
}

export async function GET() {
  if (!PROJECT_ID || !API_KEY) {
    return NextResponse.json({ count: null })
  }
  try {
    await increment()
    const count = await getCount()
    return NextResponse.json({ count })
  } catch {
    return NextResponse.json({ count: null })
  }
}
