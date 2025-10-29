"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { ShoppingCart, LogOut } from "lucide-react"

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

export default function OrdersPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])

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

      // Subscribe to buyer's orders
      const q = query(collection(db, "orders"), where("buyerId", "==", currentUser.uid))
      const unsubscribeOrders = onSnapshot(q, (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as Order[]

        setOrders(ordersData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
        setLoading(false)
      })

      return () => unsubscribeOrders()
    })

    return () => unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await signOut(auth)
    router.push("/")
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
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
        <div className="max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">My Orders</h2>
            <p className="text-slate-400">Track your orders and their status</p>
          </div>

          {/* Orders */}
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
                <p className="text-slate-400">No orders yet. Start shopping!</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Order #{order.id.slice(0, 8)}</h3>
                      <p className="text-sm text-slate-400">{order.createdAt?.toLocaleDateString()}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">
                          {item.name} - {item.quantity} {item.unit}
                        </span>
                        <span className="text-white font-medium">₹{item.totalPrice.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-700 pt-4 flex items-center justify-between">
                    <p className="text-slate-400">Total</p>
                    <p className="text-xl font-bold text-white">₹{order.totalPrice.toLocaleString()}</p>
                  </div>

                  {order.meetLink && (
                    <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                      <p className="text-blue-400 text-sm">
                        Meet Link:{" "}
                        <a href={order.meetLink} target="_blank" rel="noopener noreferrer" className="underline">
                          Join Meeting
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
