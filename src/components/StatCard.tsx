type Props = {
  title: string
  value: number | string
  tone?: "slate" | "emerald" | "amber" | "sky" | "rose"
}

const toneClasses: Record<NonNullable<Props["tone"]>, string> = {
  slate: "from-slate-900 to-slate-700 text-white",
  emerald: "from-emerald-600 to-emerald-500 text-white",
  amber: "from-amber-500 to-orange-500 text-white",
  sky: "from-sky-600 to-cyan-500 text-white",
  rose: "from-rose-600 to-pink-500 text-white",
}

export default function StatCard({ title, value, tone = "slate" }: Props) {
  return (
    <div className={`overflow-hidden rounded-3xl bg-gradient-to-br ${toneClasses[tone]} shadow-xl shadow-slate-900/10`}>
      <div className="p-5">
        <p className="text-xs uppercase tracking-[0.35em] text-white/70">{title}</p>
        <h2 className="mt-3 text-3xl font-semibold">{value}</h2>
      </div>
    </div>
  )
}
