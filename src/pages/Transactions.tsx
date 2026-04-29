import { useTransactions } from "../hooks/useTransactions"

export default function Transactions() {
  const { transactions, loading, error } = useTransactions()

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Transactions</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Loading transactions...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Transactions</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading transactions: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div>

      <h1 className="text-2xl font-bold mb-4">Transactions</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Reference</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Gateway</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map(transaction => (
              <tr key={transaction.id} className="border-t">
                <td className="p-3 font-mono text-sm">{transaction.reference}</td>
                <td className="p-3">KES {transaction.amount.toLocaleString()}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    transaction.status === 'success' ? 'bg-green-100 text-green-800' :
                    transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                    transaction.status === 'initialized' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {transaction.status}
                  </span>
                </td>
                <td className="p-3 capitalize">{transaction.gateway}</td>
                <td className="p-3 text-sm text-gray-600">
                  {new Date(transaction.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
        </div>

        {transactions.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No transactions found
          </div>
        )}

      </div>

    </div>
  )
}
