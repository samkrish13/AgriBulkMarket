"use client"

import { useState } from "react"
import { db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { OrderDetailModal } from "./order-detail-modal"

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

interface OrdersListProps {
  orders: Order[]
}

export function OrdersList({ orders }: OrdersListProps) {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleApproveOrder = async (orderId: string) => {
    setLoading(true)
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "Approved",
      })
    } catch (error) {
      console.error("Error approving order:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeclineOrder = async (orderId: string) => {
    setLoading(true)
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "Declined",
      })
    } catch (error) {
      console.error("Error declining order:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsPlaced = async (orderId: string) => {
    setLoading(true)
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "Placed",
      })
    } catch (error) {
      console.error("Error marking order as placed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsDelivered = async (orderId: string) => {
    setLoading(true)
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "Delivered",
      })
    } catch (error) {
      console.error("Error marking order as delivered:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending Approval":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
      case "Approved":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50"
      case "Declined":
        return "bg-red-500/20 text-red-400 border-red-500/50"
      case "Placed":
        return "bg-purple-500/20 text-purple-400 border-purple-500/50"
      case "Delivered":
        return "bg-green-500/20 text-green-400 border-green-500/50"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/50"
    }
  }

  const sortedOrders = [...orders].sort((a, b) => {
    const statusOrder = {
      "Pending Approval": 0,
      Approved: 1,
      Placed: 2,
      Delivered: 3,
      Declined: 4,
    }
    return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder]
  })

  return (
    <>
      <div className="space-y-4">
        {sortedOrders.map((order) => (
          <div key={order.id} className="bg-slate-700 rounded-lg border border-slate-600 overflow-hidden">
            {/* Order Header */}
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-600/50 transition-colors"
              onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold text-white">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-slate-400">{order.buyerName}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="text-right mr-4">
                <p className="font-semibold text-white">₹{order.totalPrice.toLocaleString()}</p>
                <p className="text-sm text-slate-400">{order.items.length} items</p>
              </div>
              {expandedOrderId === order.id ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </div>

            {/* Order Details */}
            {expandedOrderId === order.id && (
              <div className="border-t border-slate-600 p-4 space-y-4 bg-slate-800/50">
                {/* Items */}
                <div>
                  <h4 className="font-semibold text-white mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm bg-slate-700 p-3 rounded">
                        <div>
                          <p className="text-white font-medium">{item.name}</p>
                          <p className="text-slate-400 text-xs">{item.farmerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white">
                            {item.quantity} {item.unit}
                          </p>
                          <p className="text-slate-400">₹{item.totalPrice.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Buyer</p>
                    <p className="text-white font-medium">{order.buyerName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Total Price</p>
                    <p className="text-white font-medium">₹{order.totalPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Order Date</p>
                    <p className="text-white font-medium">{order.createdAt?.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Status</p>
                    <p className="text-white font-medium">{order.status}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  {order.status === "Pending Approval" && (
                    <>
                      <Button
                        onClick={() => handleApproveOrder(order.id)}
                        disabled={loading}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleDeclineOrder(order.id)}
                        disabled={loading}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      >
                        Decline
                      </Button>
                    </>
                  )}
                  {order.status === "Approved" && (
                    <Button
                      onClick={() => handleMarkAsPlaced(order.id)}
                      disabled={loading}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Mark as Placed
                    </Button>
                  )}
                  {order.status === "Placed" && (
                    <Button
                      onClick={() => handleMarkAsDelivered(order.id)}
                      disabled={loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Mark as Delivered
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      setSelectedOrder(order)
                      setShowDetailModal(true)
                    }}
                    variant="outline"
                    className="flex-1 text-slate-400 border-slate-600 hover:bg-slate-700 bg-transparent"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setShowDetailModal(false)} />
      )}
    </>
  )
}
