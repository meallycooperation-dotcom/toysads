import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

type Product = {
  id: string
  name: string
  description: string | null
  image_url: string | null
  price: number
  stock: number
  category: string | null
  level: string | null
  created_at: string
  product_images?: {
    image_url: string
    position: number | null
    is_main: boolean | null
  }[] | null
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_images(image_url, position, is_main)")
        .order("created_at", { ascending: false })

      if (!isMounted) return

      if (error) {
        setError(error.message)
      } else {
        setProducts(data || [])
      }

      setLoading(false)
    }

    void loadProducts()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div>

      <h1 className="text-2xl font-bold mb-4">Products</h1>

      {/* Loading */}
      {loading && (
        <p className="text-gray-500">Loading products...</p>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-500">{error}</p>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">

          <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">

            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Description</th>
                <th className="p-3">Images</th>
                <th className="p-3">Category</th>
                <th className="p-3">Level</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Created</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t">

                  <td className="p-3 font-medium">{p.name}</td>

                  <td className="p-3 text-gray-600">
                    {p.description || "-"}
                  </td>

                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      {(p.product_images?.length ? p.product_images : p.image_url ? [{ image_url: p.image_url, position: 0, is_main: true }] : []).map((image, index) => (
                        <img
                          key={`${p.id}-${index}-${image.image_url}`}
                          src={image.image_url}
                          alt={`${p.name} image ${index + 1}`}
                          className="h-12 w-12 rounded-lg object-cover border"
                        />
                      ))}
                      {!p.product_images?.length && !p.image_url && (
                        <span className="text-gray-400 text-sm">No images</span>
                      )}
                    </div>
                  </td>

                  <td className="p-3 capitalize">
                    {p.category || "-"}
                  </td>

                  <td className="p-3 capitalize">
                    {p.level || "-"}
                  </td>

                  <td className="p-3">
                    KES {p.price}
                  </td>

                  <td className="p-3">
                    {p.stock}
                  </td>

                  <td className="p-3 text-gray-500 text-sm">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
          </div>

        </div>
      )}

    </div>
  )
}
