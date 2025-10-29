"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc, collection, onSnapshot } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { BarChart3, LogOut } from "lucide-react"
import { OrdersList } from "@/components/admin/orders-list"

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

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState({
    pendingOrders: 0,
    totalFarmers: 0,
    totalBuyers: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login")
        return
      }

      const userDoc = await getDoc(doc(db, "users", currentUser.uid))
      if (!userDoc.exists() || userDoc.data().role !== "admin") {
        router.push("/select-role")
        return
      }

      setUser(currentUser)

      // Subscribe to orders
      const unsubscribeOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as Order[]

        setOrders(ordersData)

        // Calculate stats
        const pendingCount = ordersData.filter((o) => o.status === "Pending Approval").length
        const totalRevenue = ordersData
          .filter((o) => o.status === "Delivered")
          .reduce((sum, o) => sum + o.totalPrice, 0)

        setStats({
          pendingOrders: pendingCount,
          totalFarmers: 0, // Will be calculated from users collection
          totalBuyers: 0, // Will be calculated from users collection
          totalRevenue,
        })

        setLoading(false)
      })

      // Get user stats
      const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
        const farmers = snapshot.docs.filter((doc) => doc.data().role === "farmer").length
        const buyers = snapshot.docs.filter((doc) => doc.data().role === "buyer").length

        setStats((prev) => ({
          ...prev,
          totalFarmers: farmers,
          totalBuyers: buyers,
        }))
      })

      return () => {
        unsubscribeOrders()
        unsubscribeUsers()
      }
    })

    return () => unsubscribe()
  }, [router])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-64 h-screen bg-slate-800 border-r border-slate-700 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">AgroConnect</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <div className="px-4 py-2 rounded-lg bg-orange-500/20 border border-orange-500/50">
            <p className="text-sm font-semibold text-orange-400">Dashboard</p>
          </div>
          <div className="px-4 py-2 rounded-lg hover:bg-slate-700 cursor-pointer">
            <p className="text-sm text-slate-400">Orders</p>
          </div>
          <div className="px-4 py-2 rounded-lg hover:bg-slate-700 cursor-pointer">
            <p className="text-sm text-slate-400">Farmers</p>
          </div>
          <div className="px-4 py-2 rounded-lg hover:bg-slate-700 cursor-pointer">
            <p className="text-sm text-slate-400">Buyers</p>
          </div>
          <div className="px-4 py-2 rounded-lg hover:bg-slate-700 cursor-pointer">
            <p className="text-sm text-slate-400">Analytics</p>
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
            <h2 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h2>
            <p className="text-slate-400">Manage orders, farmers, and buyers</p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <p className="text-slate-400 text-sm mb-2">Pending Orders</p>
              <p className="text-3xl font-bold text-orange-400">{stats.pendingOrders}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <p className="text-slate-400 text-sm mb-2">Total Farmers</p>
              <p className="text-3xl font-bold text-green-400">{stats.totalFarmers}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <p className="text-slate-400 text-sm mb-2">Total Buyers</p>
              <p className="text-3xl font-bold text-blue-400">{stats.totalBuyers}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <p className="text-slate-400 text-sm mb-2">Total Revenue</p>
              <p className="text-3xl font-bold text-white">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>

          {/* Orders Section */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-xl font-bold text-white mb-6">All Orders</h3>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400">No orders yet</p>
              </div>
            ) : (
              <OrdersList orders={orders} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
