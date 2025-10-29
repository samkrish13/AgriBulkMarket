"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { db, auth } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { X, Trash2, Minus, Plus } from "lucide-react"

interface CartItem {
  id: string
  farmerId: string
  farmerName: string
  name: string
  quantity: number
  unit: string
  pricePerUnit: number
  cartQuantity: number
}

interface CartSidebarProps {
  cart: CartItem[]
  onRemoveFromCart: (listingId: string) => void
  onUpdateQuantity: (listingId: string, quantity: number) => void
  onClose: () => void
}

export function CartSidebar({ cart, onRemoveFromCart, onUpdateQuantity, onClose }: CartSidebarProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const cartTotal = cart.reduce((sum, item) => sum + item.cartQuantity * item.pricePerUnit, 0)
  const itemCount = cart.reduce((sum, item) => sum + item.cartQuantity, 0)

  const handlePlaceOrder = async () => {
    if (!auth.currentUser) return

    setLoading(true)
    try {
      const orderItems = cart.map((item) => ({
        listingId: item.id,
        farmerId: item.farmerId,
        farmerName: item.farmerName,
        name: item.name,
        quantity: item.cartQuantity,
        unit: item.unit,
        pricePerUnit: item.pricePerUnit,
        totalPrice: item.cartQuantity * item.pricePerUnit,
      }))

      await addDoc(collection(db, "orders"), {
        buyerId: auth.currentUser.uid,
        buyerName: auth.currentUser.displayName,
        items: orderItems,
        totalPrice: cartTotal,
        status: "Pending Approval",
        createdAt: serverTimestamp(),
        meetLink: null,
      })

      // Clear cart
      cart.forEach((item) => onRemoveFromCart(item.id))
      onClose()
      router.push("/buyer/orders")
    } catch (error) {
      console.error("Error placing order:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-slate-800 border-l border-slate-700 shadow-lg flex flex-col z-40">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700">
        <h3 className="text-xl font-bold text-white">Shopping Cart</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Your cart is empty</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="bg-slate-700 rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-white">{item.name}</h4>
                  <p className="text-xs text-slate-400">{item.farmerName}</p>
                </div>
                <button
                  onClick={() => onRemoveFromCart(item.id)}
                  className="text-slate-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-300">₹{item.pricePerUnit}/unit</p>
                <p className="text-sm font-semibold text-white">
                  ₹{(item.cartQuantity * item.pricePerUnit).toLocaleString()}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2 bg-slate-600 rounded px-2 py-1">
                <button
                  onClick={() => onUpdateQuantity(item.id, item.cartQuantity - 1)}
                  className="p-1 hover:bg-slate-500 rounded transition-colors text-slate-300"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="flex-1 text-center text-white font-medium">
                  {item.cartQuantity} {item.unit}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.id, item.cartQuantity + 1)}
                  className="p-1 hover:bg-slate-500 rounded transition-colors text-slate-300"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {cart.length > 0 && (
        <div className="border-t border-slate-700 p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span>Items:</span>
              <span>{itemCount}</span>
            </div>
            <div className="flex items-center justify-between text-lg font-bold text-white">
              <span>Total:</span>
              <span>₹{cartTotal.toLocaleString()}</span>
            </div>
          </div>

          <Button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6"
          >
            {loading ? "Placing Order..." : "Place Order"}
          </Button>
        </div>
      )}
    </div>
  )
}
