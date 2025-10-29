"use client"

import { useState } from "react"
import { db } from "@/lib/firebase"
import { doc, updateDoc, deleteDoc } from "firebase/firestore"
import { Edit2, Trash2, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Listing {
  id: string
  name: string
  quantity: number
  unit: string
  pricePerUnit: number
  photo?: string
  status: "Available" | "Reserved" | "Sold"
  createdAt: Date
}

interface ListingsTableProps {
  listings: Listing[]
}

export function ListingsTable({ listings }: ListingsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Listing>>({})

  const handleEdit = (listing: Listing) => {
    setEditingId(listing.id)
    setEditData(listing)
  }

  const handleSave = async (id: string) => {
    try {
      await updateDoc(doc(db, "listings", id), {
        name: editData.name,
        quantity: editData.quantity,
        unit: editData.unit,
        pricePerUnit: editData.pricePerUnit,
        status: editData.status,
      })
      setEditingId(null)
    } catch (error) {
      console.error("Error updating listing:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      try {
        await deleteDoc(doc(db, "listings", id))
      } catch (error) {
        console.error("Error deleting listing:", error)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-500/20 text-green-400 border-green-500/50"
      case "Reserved":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
      case "Sold":
        return "bg-slate-500/20 text-slate-400 border-slate-500/50"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/50"
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left py-3 px-4 text-slate-300 font-semibold">Name</th>
            <th className="text-left py-3 px-4 text-slate-300 font-semibold">Quantity</th>
            <th className="text-left py-3 px-4 text-slate-300 font-semibold">Price/Unit</th>
            <th className="text-left py-3 px-4 text-slate-300 font-semibold">Status</th>
            <th className="text-left py-3 px-4 text-slate-300 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((listing) => (
            <tr key={listing.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  {listing.photo ? (
                    <img
                      src={listing.photo || "/placeholder.svg"}
                      alt={listing.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-slate-500" />
                    </div>
                  )}
                  {editingId === listing.id ? (
                    <input
                      type="text"
                      value={editData.name || ""}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white"
                    />
                  ) : (
                    <span className="text-white font-medium">{listing.name}</span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-slate-300">
                {editingId === listing.id ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={editData.quantity || ""}
                      onChange={(e) => setEditData({ ...editData, quantity: Number.parseFloat(e.target.value) })}
                      className="w-20 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white"
                      step="0.01"
                    />
                    <select
                      value={editData.unit || "kg"}
                      onChange={(e) => setEditData({ ...editData, unit: e.target.value })}
                      className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white"
                    >
                      <option value="kg">kg</option>
                      <option value="ton">ton</option>
                      <option value="piece">piece</option>
                    </select>
                  </div>
                ) : (
                  `${listing.quantity} ${listing.unit}`
                )}
              </td>
              <td className="py-3 px-4 text-slate-300">
                {editingId === listing.id ? (
                  <input
                    type="number"
                    value={editData.pricePerUnit || ""}
                    onChange={(e) => setEditData({ ...editData, pricePerUnit: Number.parseFloat(e.target.value) })}
                    className="w-24 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white"
                    step="0.01"
                  />
                ) : (
                  `₹${listing.pricePerUnit}`
                )}
              </td>
              <td className="py-3 px-4">
                {editingId === listing.id ? (
                  <select
                    value={editData.status || "Available"}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value as any })}
                    className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Sold">Sold</option>
                  </select>
                ) : (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(listing.status)}`}
                  >
                    {listing.status}
                  </span>
                )}
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  {editingId === listing.id ? (
                    <>
                      <Button
                        onClick={() => handleSave(listing.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Save
                      </Button>
                      <Button
                        onClick={() => setEditingId(null)}
                        size="sm"
                        variant="outline"
                        className="text-slate-400 border-slate-600"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(listing)}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(listing.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
