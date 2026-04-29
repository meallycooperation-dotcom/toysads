import { useState } from "react"
import { ORDER_STATUSES, useOrders, type OrderStatus } from "../hooks/useOrders"

export default function Orders() {
  const { orders, loading, error, updateOrderStatus } = useOrders()
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null)

  const statusStyles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processed: "bg-blue-100 text-blue-800",
    "in transit": "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
  }

  const locationLabel = (order: (typeof orders)[number]) => {
    if (order.delivery_location_name) {
      return [
        order.delivery_location_name,
        order.delivery_location_region,
        order.delivery_location_price != null ? `KES ${order.delivery_location_price}` : null,
      ]
        .filter(Boolean)
        .join(" • ")
    }

    return order.location || "-"
  }

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setSavingOrderId(orderId)

    try {
      await updateOrderStatus(orderId, status)
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update order status")
    } finally {
      setSavingOrderId(null)
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Orders</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Loading orders...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Orders</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading orders: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div>

      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Email</th>
              <th className="p-3">Product</th>
              <th className="p-3">Location</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>

          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-t">
                <td className="p-3 font-mono text-sm">{order.id.slice(0, 8)}...</td>
                <td className="p-3">
                  <div className="font-medium">{order.customer_name || "Unknown customer"}</div>
                  {order.user_id && (
                    <div className="text-xs text-gray-500 font-mono">{order.user_id.slice(0, 8)}...</div>
                  )}
                </td>
                <td className="p-3">{order.email}</td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {order.primary_product_image_url ? (
                      <img
                        src={order.primary_product_image_url}
                        alt={order.primary_product_name || "Product"}
                        className="h-12 w-12 rounded-lg object-cover border"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg border bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                        No img
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{order.primary_product_name || "-"}</div>
                      <div className="text-xs text-gray-500">{order.items_count} item(s)</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-sm text-gray-700">
                  {locationLabel(order)}
                </td>
                <td className="p-3">{order.currency} {order.total_amount.toLocaleString()}</td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                      statusStyles[order.status] || "bg-gray-100 text-gray-700"
                    }`}>
                      {order.status}
                    </span>

                    <select
                      value={order.status}
                      disabled={savingOrderId === order.id}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-sm bg-white disabled:opacity-60"
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="p-3 text-sm text-gray-600">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
        </div>

        {orders.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No orders found
          </div>
        )}

      </div>

    </div>
  )
}
