import { useEffect, useState } from "react"
import { Edit2, Save, X, Upload } from "lucide-react"
import { supabase } from "../lib/supabase"

type Product = {
  id: string
  name: string
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

type EditState = {
  price: string
  imageFile: File | null
}

const createImagePath = (productId: string, fileName: string) =>
  `products/${productId}/${crypto.randomUUID()}-${fileName}`

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState>({
    price: "",
    imageFile: null,
  })
  const [savingProductId, setSavingProductId] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, image_url, price, stock, category, level, created_at, product_images(image_url, position, is_main)")
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

  const startEditing = (product: Product) => {
    setEditingProductId(product.id)
    setEditState({
      price: String(product.price),
      imageFile: null,
    })
  }

  const cancelEditing = () => {
    setEditingProductId(null)
    setEditState({
      price: "",
      imageFile: null,
    })
  }

  const handleSave = async (product: Product) => {
    setSavingProductId(product.id)

    try {
      const parsedPrice = Number(editState.price)

      if (Number.isNaN(parsedPrice)) {
        throw new Error("Please enter a valid price")
      }

      const updatePayload: { price: number; image_url?: string } = {
        price: parsedPrice,
      }

      let uploadedImageUrl: string | null = null

      if (editState.imageFile) {
        const filePath = createImagePath(product.id, editState.imageFile.name)
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, editState.imageFile)

        if (uploadError) throw uploadError

        uploadedImageUrl = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath).data.publicUrl

        updatePayload.image_url = uploadedImageUrl
      }

      const { error: updateError } = await supabase
        .from("products")
        .update(updatePayload)
        .eq("id", product.id)

      if (updateError) throw updateError

      if (uploadedImageUrl) {
        const { error: imageUpdateError } = await supabase
          .from("product_images")
          .update({ image_url: uploadedImageUrl })
          .eq("product_id", product.id)
          .eq("is_main", true)

        if (imageUpdateError) {
          const { error: fallbackImageUpdateError } = await supabase
            .from("product_images")
            .update({ image_url: uploadedImageUrl })
            .eq("product_id", product.id)
            .eq("position", 0)

          if (fallbackImageUpdateError) throw fallbackImageUpdateError
        }
      }

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                price: parsedPrice,
                image_url: uploadedImageUrl ?? item.image_url,
                product_images: uploadedImageUrl
                  ? item.product_images?.map((image) =>
                      image.is_main || image.position === 0
                        ? { ...image, image_url: uploadedImageUrl }
                        : image
                    ) ?? item.product_images
                  : item.product_images,
              }
            : item
        )
      )

      cancelEditing()
    } catch (saveError) {
      console.error(saveError)
      alert(saveError instanceof Error ? saveError.message : "Failed to update product")
    } finally {
      setSavingProductId(null)
    }
  }

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
                <th className="p-3">Images</th>
                <th className="p-3">Category</th>
                <th className="p-3">Level</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Actions</th>
                <th className="p-3">Created</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t">

                  <td className="p-3 font-medium">{p.name}</td>

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
                    {editingProductId === p.id ? (
                      <input
                        type="number"
                        value={editState.price}
                        onChange={(e) => setEditState((current) => ({ ...current, price: e.target.value }))}
                        className="w-28 rounded-lg border px-3 py-2"
                      />
                    ) : (
                      `KES ${p.price}`
                    )}
                  </td>

                  <td className="p-3">
                    {p.stock}
                  </td>

                  <td className="p-3">
                    {editingProductId === p.id ? (
                      <div className="space-y-3">
                        <label className="block">
                          <span className="mb-1 block text-xs font-medium text-gray-500">Replace image</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setEditState((current) => ({ ...current, imageFile: e.target.files?.[0] || null }))}
                              className="w-full text-sm"
                            />
                          </div>
                        </label>
                        {editState.imageFile && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <Upload size={14} /> {editState.imageFile.name}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => void handleSave(p)}
                            disabled={savingProductId === p.id}
                            className="inline-flex items-center gap-1 rounded-lg bg-black px-3 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-60"
                          >
                            <Save size={16} />
                            {savingProductId === p.id ? "Saving..." : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                          >
                            <X size={16} />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEditing(p)}
                        className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                    )}
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
