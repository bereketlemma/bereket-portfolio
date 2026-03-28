const achievements = [
  {
    title: "ICPC Pacific Northwest Regional",
    result: "3rd Place",
    year: "2025",
    description:
      "Competed against top university teams across the Pacific Northwest region. Solved complex algorithmic problems under time pressure in a team of 3.",
  },
  {
    title: "NeetCode Progress",
    result: "150+ Problems",
    year: "Ongoing",
    description:
      "Consistent LeetCode practice focused on arrays, graphs, dynamic programming, and system design problems targeting FAANG-level interviews.",
  },
]

export default function Competitive() {
  return (
    <section id="competitive" className="py-20">

      {/* Section header */}
      <div className="mb-12 flex items-center gap-4">
        <span className="font-mono text-sm text-accent">05.</span>
        <h2 className="font-syne text-2xl font-bold text-foreground">
          Competitive Programming
        </h2>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {achievements.map((item, i) => (
          <div
            key={i}
            className="rounded border border-border/40 p-6 hover:border-accent/30 transition-all"
          >
            <div className="flex items-start justify-between">
              <h3 className="font-syne text-base font-bold text-foreground">
                {item.title}
              </h3>
              <span className="font-mono text-xs text-muted-foreground">
                {item.year}
              </span>
            </div>
            <p className="mt-2 font-mono text-sm text-accent">{item.result}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          </div>
        ))}
      </div>

    </section>
  )
}