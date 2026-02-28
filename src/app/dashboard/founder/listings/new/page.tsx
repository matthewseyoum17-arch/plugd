'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createListing } from './actions'
import { createClient } from '@/lib/supabase/client'
import { X, Image as ImageIcon } from 'lucide-react'

export default function CreateListing() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.from('categories').select('id, name').order('sort_order').then(({ data }) => {
      if (data) setCategories(data)
    })
  }, [supabase])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB')
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    let coverImageUrl = ''

    // Upload image if selected
    if (imageFile) {
      setUploadingImage(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in')
        setLoading(false)
        return
      }

      const ext = imageFile.name.split('.').pop()
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(path, imageFile, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`)
        setLoading(false)
        setUploadingImage(false)
        return
      }

      const { data: publicUrl } = supabase.storage
        .from('listing-images')
        .getPublicUrl(path)

      coverImageUrl = publicUrl.publicUrl
      setUploadingImage(false)
    }

    const formData = new FormData(e.currentTarget)
    formData.set('cover_image_url', coverImageUrl)

    const result = await createListing(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">New Listing</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Product Title *
          </label>
          <input
            type="text"
            name="title"
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#ffffff] text-white"
            required
            placeholder="e.g., AI Receptionist for Dental Offices"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#ffffff] text-white h-32"
            required
            placeholder="Describe your AI product and its key features..."
          />
        </div>

        {/* Category dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category
          </label>
          <select
            name="category_id"
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#ffffff] text-white appearance-none cursor-pointer"
          >
            <option value="">Select a category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Cover image upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Cover Image
          </label>
          {imagePreview ? (
            <div className="relative rounded-lg overflow-hidden border border-[#2a2a2a]">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-48 bg-[#1a1a1a] border-2 border-dashed border-[#2a2a2a] rounded-lg cursor-pointer hover:border-[#ffffff]/50 transition-colors">
              <ImageIcon className="w-8 h-8 text-gray-600 mb-2" />
              <span className="text-sm text-gray-500">Click to upload cover image</span>
              <span className="text-xs text-gray-600 mt-1">PNG, JPG up to 5MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Ideal Customer
          </label>
          <input
            type="text"
            name="ideal_customer"
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#ffffff] text-white"
            placeholder="e.g., Dental practices with 2-10 locations"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Product URL
          </label>
          <input
            type="url"
            name="product_url"
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#ffffff] text-white"
            placeholder="https://yourproduct.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Commission per Appointment ($) *
            </label>
            <input
              type="number"
              step="0.01"
              min="25"
              name="commission_per_appointment"
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#ffffff] text-white"
              placeholder="25.00"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Minimum $25.00</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Commission per Close ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="commission_per_close"
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#ffffff] text-white"
              placeholder="250.00"
            />
          </div>
        </div>

        {/* Budget & Setter Controls */}
        <div className="border border-[#2a2a2a] rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-medium text-[#ffffff]">Budget & Setter Controls</h3>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Active Setters
            </label>
            <input
              type="number"
              min="1"
              max="50"
              name="max_setters"
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#ffffff] text-white"
              placeholder="5"
              defaultValue="5"
            />
            <p className="text-xs text-gray-500 mt-1">Max setters that can be approved at once. Extra applicants go to waitlist.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Appointments *
              </label>
              <input
                type="number"
                min="1"
                name="max_appointments"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#ffffff] text-white"
                placeholder="20"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Total appointments you&apos;re willing to pay for</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Daily Cap per Setter
              </label>
              <input
                type="number"
                min="1"
                max="10"
                name="daily_setter_cap"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#ffffff] text-white"
                placeholder="3"
                defaultValue="3"
              />
              <p className="text-xs text-gray-500 mt-1">Max submissions per setter per day</p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Qualified Meeting Definition *
          </label>
          <textarea
            name="qualified_meeting_definition"
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#ffffff] text-white h-24"
            required
            placeholder="Define what counts as a qualified meeting..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Pitch Kit URL
          </label>
          <input
            type="url"
            name="pitch_kit_url"
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#ffffff] text-white"
            placeholder="https://docs.google.com/..."
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            name="tags"
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg focus:outline-none focus:border-[#ffffff] text-white"
            placeholder="e.g., AI, SaaS, Healthcare, B2B"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#ffffff] text-black font-medium rounded-lg hover:bg-[#00cc76] transition-colors disabled:opacity-50"
          >
            {uploadingImage ? 'Uploading image...' : loading ? 'Creating...' : 'Create Listing'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-[#1a1a1a] text-gray-300 border border-[#2a2a2a] rounded-lg hover:bg-[#2a2a2a] transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
