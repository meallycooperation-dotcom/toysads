import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export type Transaction = {
  id: string
  order_id: string | null
  reference: string
  amount: number
  status: string
  gateway: string
  paid_at: string | null
  created_at: string
  updated_at: string
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = async () => {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setTransactions(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchTransactions()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

  return { transactions, loading, error, refetch: fetchTransactions }
}
