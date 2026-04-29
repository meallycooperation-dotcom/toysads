import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function AddProduct() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")
  const [category, setCategory] = useState("")
  const [level, setLevel] = useState("")
  const [image1, setImage1] = useState<File | null>(null)
  const [image2, setImage2] = useState<File | null>(null)
  const [image3, setImage3] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const files = [image1, image2, image3].filter(Boolean) as File[]

    if (files.length === 0) {
      alert("Please select at least one image")
      return
    }

    setLoading(true)

    try {
      // 🧱 1. Create product
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          name,
          description,
          price: Number(price), // store as integer
          stock: Number(stock),
          category,
          level,
        })
        .select()
        .single()

      if (productError) throw productError

      const productId = product.id

      // 🖼️ 2. Upload images
      const imageInserts = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        const filePath = `products/${productId}/${Date.now()}-${file.name}`

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // Get public URL immediately after upload to avoid race condition
        const imageUrl = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath).data.publicUrl

        imageInserts.push({
          product_id: productId,
          image_url: imageUrl,
          position: i,
          is_main: i === 0, // first image = main
        })
      }

      // 💾 3. Save images to DB
      const { error: imageError } = await supabase
        .from("product_images")
        .insert(imageInserts)

      if (imageError) throw imageError

      // 🖼️ 4. Update product with main image URL
      const mainImageUrl = imageInserts.find(img => img.is_main)?.image_url
      if (mainImageUrl) {
        const { error: updateError } = await supabase
          .from("products")
          .update({ image_url: mainImageUrl })
          .eq("id", productId)

        if (updateError) throw updateError
      }

      alert("Product created successfully!")

      // 🔄 Reset form
      setName("")
      setDescription("")
      setPrice("")
      setStock("")
      setCategory("")
      setLevel("")
      setImage1(null)
      setImage2(null)
      setImage3(null)

    } catch (error: unknown) {
      console.error(error)
      alert(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-sm">
      <h1 className="text-xl font-semibold mb-4">Add Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Name */}
        <input
          type="text"
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          required
        />

        {/* Description */}
        <textarea
          placeholder="Product description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 min-h-28"
          required
        />

        {/* Price */}
        <input
          type="number"
          placeholder="Price (KES)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          required
        />

        {/* Category */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 bg-white"
          required
        >
          <option value="">Select category</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        {/* Level */}
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 bg-white"
          required
        >
          <option value="">Select level</option>
          <option value="intense">Intense</option>
          <option value="luxurious">Luxurious</option>
          <option value="playful">Playful</option>
        </select>

        {/* Stock */}
        <input
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          required
        />

        {/* Images */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Product Images (First image is main)</p>
          
          {/* Image 1 */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage1(e.target.files?.[0] || null)}
            className="w-full"
          />
          {image1 && <p className="text-xs text-green-600">✓ {image1.name}</p>}

          {/* Image 2 */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage2(e.target.files?.[0] || null)}
            className="w-full"
          />
          {image2 && <p className="text-xs text-green-600">✓ {image2.name}</p>}

          {/* Image 3 */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage3(e.target.files?.[0] || null)}
            className="w-full"
          />
          {image3 && <p className="text-xs text-green-600">✓ {image3.name}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
        >
          {loading ? "Creating..." : "Create Product"}
        </button>

      </form>
    </div>
  )
}
