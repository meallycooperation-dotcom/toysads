import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export const ORDER_STATUSES = ['pending', 'processed', 'in transit', 'delivered'] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

type ProductImageRow = {
  image_url: string
  position: number | null
  is_main: boolean | null
}

type ProductRow = {
  id: string
  name: string
  image_url: string | null
  product_images: ProductImageRow[] | null
}

type OrderItemRow = {
  order_id: string | null
  quantity: number
  price_at_purchase: number
  products: ProductRow[] | ProductRow | null
}

type ProfileRow = {
  id: string
  name: string | null
  email: string | null
}

type DeliveryLocationRow = {
  value: string
  name: string
  region: string
  price: number
}

export type Order = {
  id: string
  user_id: string | null
  email: string
  total_amount: number
  currency: string
  status: OrderStatus | string
  paystack_reference: string | null
  created_at: string
  updated_at: string
  location: string | null
  customer_name: string | null
  delivery_location_name: string | null
  delivery_location_region: string | null
  delivery_location_price: number | null
  primary_product_name: string | null
  primary_product_image_url: string | null
  items_count: number
}

function getPrimaryImageUrl(product: ProductRow | null) {
  if (!product) return null

  const mainImage = product.product_images?.find(image => image.is_main) ?? product.product_images?.[0]
  return mainImage?.image_url ?? product.image_url ?? null
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)

    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('id, user_id, email, total_amount, currency, status, paystack_reference, created_at, updated_at, location')
      .order('created_at', { ascending: false })

    if (ordersError) {
      setError(ordersError.message)
      setLoading(false)
      return
    }

    const rawOrders = ordersData || []

    if (rawOrders.length === 0) {
      setOrders([])
      setLoading(false)
      return
    }

    const orderIds = rawOrders.map(order => order.id)
    const userIds = [...new Set(rawOrders.map(order => order.user_id).filter(Boolean))] as string[]
    const locationValues = [...new Set(rawOrders.map(order => order.location).filter(Boolean))] as string[]

    const [
      profilesResult,
      locationsResult,
      orderItemsResult,
    ] = await Promise.all([
      userIds.length > 0
        ? supabase
            .from('profiles')
            .select('id, name, email')
            .in('id', userIds)
        : Promise.resolve({ data: [], error: null }),
      locationValues.length > 0
        ? supabase
            .from('delivery_locations')
            .select('value, name, region, price')
            .in('value', locationValues)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from('order_items')
        .select(`
          order_id,
          quantity,
          price_at_purchase,
          products (
            id,
            name,
            image_url,
            product_images (
              image_url,
              position,
              is_main
            )
          )
        `)
        .in('order_id', orderIds),
    ])

    if (profilesResult.error) {
      setError(profilesResult.error.message)
      setLoading(false)
      return
    }

    if (locationsResult.error) {
      setError(locationsResult.error.message)
      setLoading(false)
      return
    }

    if (orderItemsResult.error) {
      setError(orderItemsResult.error.message)
      setLoading(false)
      return
    }

    const profileMap = new Map<string, ProfileRow>(
      (profilesResult.data as ProfileRow[] | null || []).map(profile => [profile.id, profile])
    )

    const locationMap = new Map<string, DeliveryLocationRow>(
      (locationsResult.data as DeliveryLocationRow[] | null || []).map(location => [location.value, location])
    )

    const itemsByOrder = new Map<string, OrderItemRow[]>()
    ;(orderItemsResult.data as unknown as OrderItemRow[] | null || []).forEach(item => {
      if (!item.order_id) return

      const existing = itemsByOrder.get(item.order_id) || []
      existing.push(item)
      itemsByOrder.set(item.order_id, existing)
    })

    const enrichedOrders: Order[] = rawOrders.map(order => {
      const orderItems = itemsByOrder.get(order.id) || []
      const primaryItem = orderItems[0]
      const primaryProduct = Array.isArray(primaryItem?.products)
        ? primaryItem?.products[0] || null
        : primaryItem?.products || null
      const deliveryLocation = order.location ? locationMap.get(order.location) || null : null
      const profile = order.user_id ? profileMap.get(order.user_id) || null : null

      return {
        ...order,
        customer_name: profile?.name || null,
        delivery_location_name: deliveryLocation?.name || null,
        delivery_location_region: deliveryLocation?.region || null,
        delivery_location_price: deliveryLocation?.price ?? null,
        primary_product_name: primaryProduct?.name || null,
        primary_product_image_url: getPrimaryImageUrl(primaryProduct),
        items_count: orderItems.reduce((count, item) => count + item.quantity, 0),
      }
    })

    setOrders(enrichedOrders)
    setLoading(false)
  }

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (error) {
      throw error
    }

    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, status }
          : order
      )
    )
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchOrders()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

  return { orders, loading, error, refetch: fetchOrders, updateOrderStatus }
}
