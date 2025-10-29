"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { ShoppingCart, LogOut, MapPin, Phone } from "lucide-react"
import { OrderTimeline } from "@/components/order/order-timeline"

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
  approvedAt?: Date
  placedAt?: Date
  deliveredAt?: Date
  meetLink?: string
  declineReason?: string
}

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login")
        return
      }

      const userDoc = await getDoc(doc(db, "users", currentUser.uid))
      if (!userDoc.exists() || userDoc.data().role !== "buyer") {
        router.push("/select-role")
        return
      }

      setUser(currentUser)

      // Get order details
      const orderDoc = await getDoc(doc(db, "orders", orderId))
      if (orderDoc.exists()) {
        const orderData = orderDoc.data()
        if (orderData.buyerId === currentUser.uid) {
          setOrder({
            id: orderId,
            ...orderData,
            createdAt: orderData.createdAt?.toDate(),
            approvedAt: orderData.approvedAt?.toDate(),
            placedAt: orderData.placedAt?.toDate(),
            deliveredAt: orderData.deliveredAt?.toDate(),
          } as Order)
        }
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [router, orderId])

  const handleLogout = async () => {
    await signOut(auth)
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Order not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-64 h-screen bg-slate-800 border-r border-slate-700 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">AgroConnect</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <div className="px-4 py-2 rounded-lg hover:bg-slate-700 cursor-pointer">
            <p className="text-sm text-slate-400">Dashboard</p>
          </div>
          <div className="px-4 py-2 rounded-lg hover:bg-slate-700 cursor-pointer">
            <p className="text-sm text-slate-400">Browse Catalog</p>
          </div>
          <div className="px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/50">
            <p className="text-sm font-semibold text-blue-400">My Orders</p>
          </div>
          <div className="px-4 py-2 rounded-lg hover:bg-slate-700 cursor-pointer">
            <p className="text-sm text-slate-400">Plans</p>
          </div>
          <div className="px-4 py-2 rounded-lg hover:bg-slate-700 cursor-pointer">
            <p className="text-sm text-slate-400">Profile</p>
          </div>
        </nav>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full text-slate-400 border-slate-600 hover:bg-slate-700 bg-transparent"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="mb-4 text-slate-400 border-slate-600 hover:bg-slate-700 bg-transparent"
            >
              ← Back
            </Button>
            <h2 className="text-3xl font-bold text-white mb-2">Order #{order.id.slice(0, 8)}</h2>
            <p className="text-slate-400">{order.createdAt?.toLocaleDateString()}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Order Items</h3>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                      <div>
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-sm text-slate-400">{item.farmerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">
                          {item.quantity} {item.unit}
                        </p>
                        <p className="text-slate-400 text-sm">₹{item.totalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Timeline */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Order Status</h3>
                <OrderTimeline
                  status={order.status}
                  createdAt={order.createdAt}
                  approvedAt={order.approvedAt}
                  placedAt={order.placedAt}
                  deliveredAt={order.deliveredAt}
                />
              </div>

              {/* Meet Link */}
              {order.meetLink && order.status === "Approved" && (
                <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-blue-400 mb-3">Verification Meeting</h3>
                  <p className="text-slate-300 mb-4">Join the meeting with the admin to verify your order details</p>
                  <a
                    href={order.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Join Google Meet
                  </a>
                </div>
              )}

              {/* Decline Reason */}
              {order.status === "Declined" && order.declineReason && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-red-400 mb-2">Order Declined</h3>
                  <p className="text-slate-300">Reason: {order.declineReason}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="text-white font-medium">₹{order.totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-slate-700 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold">Total</span>
                      <span className="text-2xl font-bold text-white">₹{order.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <p className="text-slate-400 text-sm mb-2">Current Status</p>
                <div
                  className={`px-4 py-2 rounded-lg text-center font-semibold ${
                    order.status === "Pending Approval"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : order.status === "Approved"
                        ? "bg-blue-500/20 text-blue-400"
                        : order.status === "Placed"
                          ? "bg-purple-500/20 text-purple-400"
                          : order.status === "Delivered"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {order.status}
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Need Help?</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-300">+91 XXXX XXXX XX</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-300">support@agroconnect.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
