"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ImageIcon, Plus } from "lucide-react"

interface Listing {
  id: string
  farmerId: string
  farmerName: string
  name: string
  quantity: number
  unit: string
  pricePerUnit: number
  photo?: string
  status: "Available" | "Reserved" | "Sold"
}

interface CatalogGridProps {
  listings: Listing[]
  onAddToCart: (listing: Listing, quantity: number) => void
}

export function CatalogGrid({ listings, onAddToCart }: CatalogGridProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const handleQuantityChange = (listingId: string, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [listingId]: Math.max(1, value),
    }))
  }

  const handleAddToCart = (listing: Listing) => {
    const quantity = quantities[listing.id] || 1
    onAddToCart(listing, quantity)
    setQuantities((prev) => ({
      ...prev,
      [listing.id]: 1,
    }))
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <div
          key={listing.id}
          className="bg-slate-700 rounded-lg border border-slate-600 overflow-hidden hover:border-blue-500 transition-colors"
        >
          {/* Image */}
          <div className="w-full h-40 bg-slate-600 flex items-center justify-center overflow-hidden">
            {listing.photo ? (
              <img
                src={listing.photo || "/placeholder.svg"}
                alt={listing.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-12 h-12 text-slate-500" />
            )}
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <div>
              <h4 className="text-lg font-semibold text-white">{listing.name}</h4>
              <p className="text-sm text-slate-400">{listing.farmerName}</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">₹{listing.pricePerUnit}</p>
                <p className="text-xs text-slate-400">per {listing.unit}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-300">{listing.quantity}</p>
                <p className="text-xs text-slate-400">{listing.unit} available</p>
              </div>
            </div>

            {/* Quantity Input */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-300">Qty:</label>
              <input
                type="number"
                min="1"
                max={listing.quantity}
                value={quantities[listing.id] || 1}
                onChange={(e) => handleQuantityChange(listing.id, Number.parseInt(e.target.value))}
                className="w-16 bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
              />
              <span className="text-xs text-slate-400">{listing.unit}</span>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={() => handleAddToCart(listing)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
