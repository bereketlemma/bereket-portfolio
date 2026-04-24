import { NextResponse } from "next/server"

export type GithubEvent = {
  id: string
  type: string
  repo: string
  repoUrl: string
  description: string
  url: string
  date: string
}

export type GithubStats = {
  followers: number
  repos: number
  stars: number
  pushCount: number
}

const REPOS = [
  "llvm-dse-pass",
  "devscope",
  "llm-inference-bench",
  "low-latency-trading-engine",
  "statistical-arbitrage-backtester",
  "bereket-portfolio",
]

function ghHeaders(): HeadersInit {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  }
  if (process.env.GITHUB_TOKEN) {
    h["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  return h
}

function formatEvent(e: any): GithubEvent | null {
  const repo = (e.repo?.name as string)?.replace("bereketlemma/", "") ?? ""
  const repoUrl = `https://github.com/${e.repo?.name}`
  const date: string = e.created_at

  switch (e.type) {
    case "PushEvent": {
      const commits: any[] = e.payload?.commits ?? []
      if (!commits.length) return null
      const last = commits[commits.length - 1]
      return { id: e.id, type: "push", repo, repoUrl, description: last?.message?.split("\n")[0]?.slice(0, 65) ?? "", url: `${repoUrl}/commit/${last?.sha ?? ""}`, date }
    }
    case "CreateEvent": {
      const ref: string = e.payload?.ref ?? ""
      const refType = e.payload?.ref_type ?? "repository"
      return { id: e.id, type: "create", repo, repoUrl, description: ref ? `created ${refType} ${ref}` : `created ${refType}`, url: repoUrl, date }
    }
    case "WatchEvent":
      return { id: e.id, type: "star", repo, repoUrl, description: "starred", url: repoUrl, date }
    case "ForkEvent":
      return { id: e.id, type: "fork", repo, repoUrl, description: "forked", url: repoUrl, date }
    case "PullRequestEvent":
      return { id: e.id, type: "pr", repo, repoUrl, description: `${e.payload?.action ?? "opened"} PR: ${e.payload?.pull_request?.title?.slice(0, 48) ?? ""}`, url: e.payload?.pull_request?.html_url ?? repoUrl, date }
    case "IssuesEvent":
      return { id: e.id, type: "issue", repo, repoUrl, description: `${e.payload?.action ?? "opened"} issue: ${e.payload?.issue?.title?.slice(0, 48) ?? ""}`, url: e.payload?.issue?.html_url ?? repoUrl, date }
    case "IssueCommentEvent":
      return { id: e.id, type: "comment", repo, repoUrl, description: "commented on an issue", url: e.payload?.comment?.html_url ?? repoUrl, date }
    case "DeleteEvent":
      return { id: e.id, type: "delete", repo, repoUrl, description: `deleted ${e.payload?.ref_type ?? "branch"} ${e.payload?.ref ?? ""}`, url: repoUrl, date }
    case "PublicEvent":
      return { id: e.id, type: "public", repo, repoUrl, description: "made repository public", url: repoUrl, date }
    default:
      return null
  }
}

async function fetchEvents(): Promise<GithubEvent[]> {
  const events: GithubEvent[] = []
  for (const page of [1, 2]) {
    try {
      const res = await fetch(
        `https://api.github.com/users/bereketlemma/events?per_page=100&page=${page}`,
        { headers: ghHeaders(), cache: "no-store" }
      )
      if (!res.ok) break
      const data = await res.json()
      if (!Array.isArray(data) || !data.length) break
      for (const e of data) {
        const f = formatEvent(e)
        if (f) events.push(f)
      }
    } catch { break }
  }
  return events
}

async function fetchCommits(): Promise<GithubEvent[]> {
  const all: GithubEvent[] = []
  await Promise.all(REPOS.map(async (repo) => {
    try {
      const res = await fetch(
        `https://api.github.com/repos/bereketlemma/${repo}/commits?per_page=10`,
        { headers: ghHeaders(), cache: "no-store" }
      )
      if (!res.ok) return
      const data = await res.json()
      if (!Array.isArray(data)) return
      for (const c of data) {
        all.push({
          id: c.sha, type: "push", repo,
          repoUrl: `https://github.com/bereketlemma/${repo}`,
          description: c.commit?.message?.split("\n")[0]?.slice(0, 65) ?? "",
          url: c.html_url,
          date: c.commit?.author?.date ?? c.commit?.committer?.date ?? "",
        })
      }
    } catch { /* skip */ }
  }))
  return all
}

async function fetchUserStats(): Promise<GithubStats> {
  const defaults: GithubStats = { followers: 0, repos: 0, stars: 0, pushCount: 0 }
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch("https://api.github.com/users/bereketlemma", { headers: ghHeaders(), cache: "no-store" }),
      fetch("https://api.github.com/users/bereketlemma/repos?per_page=100", { headers: ghHeaders(), cache: "no-store" }),
    ])
    const user = userRes.ok ? await userRes.json() : {}
    const repos = reposRes.ok ? await reposRes.json() : []
    const stars = Array.isArray(repos)
      ? repos.reduce((sum: number, r: any) => sum + (r.stargazers_count ?? 0), 0)
      : 0
    return {
      followers: user.followers ?? 0,
      repos: user.public_repos ?? 0,
      stars,
      pushCount: 0,
    }
  } catch {
    return defaults
  }
}

export const revalidate = 180

export async function GET() {
  try {
    const [events, stats] = await Promise.all([
      fetchEvents().then(async (evts) => {
        if (evts.length) return evts
        return fetchCommits()
      }),
      fetchUserStats(),
    ])

    const deduped = events
      .filter((e, i, arr) => arr.findIndex((x) => x.id === e.id) === i)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 25)

    const pushCount = deduped.filter((e) => e.type === "push").length

    return NextResponse.json({ events: deduped, stats: { ...stats, pushCount } })
  } catch (err) {
    console.error("[github-activity]", err)
    return NextResponse.json({ events: [], stats: { followers: 0, repos: 0, stars: 0, pushCount: 0 } }, { status: 500 })
  }
}
