import StatCard from "../components/StatCard"
import { useDashboardStats } from "../hooks/useDashboardStats"

export default function Home() {
  const { stats, loading, error } = useDashboardStats()

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading dashboard: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Dashboard</p>
        <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">Admin overview</h1>
            <p className="mt-1 text-sm text-slate-500">
              Live business snapshot for orders, revenue, products, and payment health.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total Orders" value={stats.totalOrders} tone="slate" />
        <StatCard title="Revenue (KES)" value={stats.totalRevenue.toLocaleString()} tone="emerald" />
        <StatCard title="Products" value={stats.totalProducts} tone="sky" />
        <StatCard title="Pending Orders" value={stats.pendingOrders} tone="amber" />
        <StatCard title="Successful Transactions" value={stats.successfulTransactions} tone="rose" />
      </div>

    </div>
  )
}
