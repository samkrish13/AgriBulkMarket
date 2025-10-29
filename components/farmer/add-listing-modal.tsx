"use client"

import type React from "react"

import { useState } from "react"
import { db, storage } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface AddListingModalProps {
  isOpen: boolean
  onClose: () => void
  farmerId: string
}

export function AddListingModal({ isOpen, onClose, farmerId }: AddListingModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    unit: "kg",
    pricePerUnit: "",
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPhoto(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      let photoURL = ""

      // Upload photo if provided
      if (photo) {
        const storageRef = ref(storage, `listings/${farmerId}/${Date.now()}-${photo.name}`)
        await uploadBytes(storageRef, photo)
        photoURL = await getDownloadURL(storageRef)
      }

      // Add listing to Firestore
      await addDoc(collection(db, "listings"), {
        farmerId,
        name: formData.name,
        quantity: Number.parseFloat(formData.quantity),
        unit: formData.unit,
        pricePerUnit: Number.parseFloat(formData.pricePerUnit),
        photo: photoURL,
        status: "Available",
        createdAt: serverTimestamp(),
      })

      // Reset form
      setFormData({
        name: "",
        quantity: "",
        unit: "kg",
        pricePerUnit: "",
      })
      setPhoto(null)
      onClose()
    } catch (err) {
      setError("Failed to add listing. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Add New Listing</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Vegetable Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Tomato"
              required
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="100"
                required
                step="0.01"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Unit</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
              >
                <option value="kg">kg</option>
                <option value="ton">ton</option>
                <option value="piece">piece</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Price per Unit (₹)</label>
            <input
              type="number"
              name="pricePerUnit"
              value={formData.pricePerUnit}
              onChange={handleInputChange}
              placeholder="50"
              required
              step="0.01"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Photo (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-slate-400 focus:outline-none focus:border-green-500"
            />
            {photo && <p className="text-sm text-green-400 mt-2">✓ {photo.name}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 text-slate-400 border-slate-600 hover:bg-slate-700 bg-transparent"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
              {loading ? "Adding..." : "Add Listing"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
