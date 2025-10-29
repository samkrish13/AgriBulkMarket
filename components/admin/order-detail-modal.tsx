"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface OrderItem {
  listingId: string
  farmerId: string
  farmerName: string
  name: string
  quantity: number
  unit: string
  pricePerUnit: number
  totalPrice: number
}

interface Order {
  id: string
  buyerId: string
  buyerName: string
  items: OrderItem[]
  totalPrice: number
  status: "Pending Approval" | "Approved" | "Declined" | "Placed" | "Delivered"
  createdAt: Date
  meetLink?: string
}

interface OrderDetailModalProps {
  order: Order
  onClose: () => void
}

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Order Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Info */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-slate-400 text-sm mb-1">Order ID</p>
            <p className="text-white font-mono">{order.id}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Status</p>
            <p className="text-white font-medium">{order.status}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Buyer</p>
            <p className="text-white font-medium">{order.buyerName}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Order Date</p>
            <p className="text-white font-medium">{order.createdAt?.toLocaleDateString()}</p>
          </div>
        </div>

        {/* Items */}
        <div className="mb-6">
          <h3 className="font-semibold text-white mb-3">Items</h3>
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="bg-slate-700 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium">{item.name}</p>
                  <p className="text-white font-semibold">₹{item.totalPrice.toLocaleString()}</p>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <p>{item.farmerName}</p>
                  <p>
                    {item.quantity} {item.unit} @ ₹{item.pricePerUnit}/unit
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-slate-700 pt-4 mb-6">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-white">Total</p>
            <p className="text-2xl font-bold text-white">₹{order.totalPrice.toLocaleString()}</p>
          </div>
        </div>

        {/* Close Button */}
        <Button onClick={onClose} className="w-full bg-slate-700 hover:bg-slate-600 text-white">
          Close
        </Button>
      </div>
    </div>
  )
}
