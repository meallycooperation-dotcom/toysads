import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export type DashboardStats = {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  pendingOrders: number
  successfulTransactions: number
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    pendingOrders: 0,
    successfulTransactions: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch all stats in parallel
      const [ordersResult, productsResult, transactionsResult] = await Promise.all([
        supabase.from('orders').select('total_amount, status'),
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('transactions').select('status')
      ])

      if (ordersResult.error) throw ordersResult.error
      if (productsResult.error) throw productsResult.error
      if (transactionsResult.error) throw transactionsResult.error

      const orders = ordersResult.data || []
      const productsCount = productsResult.count || 0
      const transactions = transactionsResult.data || []

      // Calculate stats
      const totalOrders = orders.length
      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)
      const pendingOrders = orders.filter(order => order.status === 'pending').length
      const successfulTransactions = transactions.filter(tx => tx.status === 'success').length

      setStats({
        totalOrders,
        totalRevenue,
        totalProducts: productsCount,
        pendingOrders,
        successfulTransactions
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchStats()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

  return { stats, loading, error, refetch: fetchStats }
}
