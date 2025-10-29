"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Leaf, Plus, LogOut } from "lucide-react"
import { AddListingModal } from "@/components/farmer/add-listing-modal"
import { ListingsTable } from "@/components/farmer/listings-table"

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

export default function FarmerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState<Listing[]>([])
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login")
        return
      }

      const userDoc = await getDoc(doc(db, "users", currentUser.uid))
      if (!userDoc.exists() || userDoc.data().role !== "farmer") {
        router.push("/select-role")
        return
      }

      setUser(currentUser)

      // Subscribe to listings
      const q = query(collection(db, "listings"), where("farmerId", "==", currentUser.uid))
      const unsubscribeListings = onSnapshot(q, (snapshot) => {
        const listingsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as Listing[]
        setListings(listingsData)
        setLoading(false)
      })

      return () => unsubscribeListings()
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

  const activeListings = listings.filter((l) => l.status === "Available").length
  const totalRevenue = listings
    .filter((l) => l.status === "Sold")
    .reduce((sum, l) => sum + l.quantity * l.pricePerUnit, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-64 h-screen bg-slate-800 border-r border-slate-700 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">AgroConnect</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <div className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/50">
            <p className="text-sm font-semibold text-green-400">Dashboard</p>
          </div>
          <div className="px-4 py-2 rounded-lg hover:bg-slate-700 cursor-pointer">
            <p className="text-sm text-slate-400">My Listings</p>
          </div>
          <div className="px-4 py-2 rounded-lg hover:bg-slate-700 cursor-pointer">
            <p className="text-sm text-slate-400">Orders</p>
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome, {user?.displayName}</h2>
              <p className="text-slate-400">Manage your vegetable listings and track orders</p>
            </div>
            <Button onClick={() => setShowAddModal(true)} className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Listing
            </Button>
          </div>

          {/* Dashboard Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <p className="text-slate-400 text-sm mb-2">Active Listings</p>
              <p className="text-3xl font-bold text-white">{activeListings}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <p className="text-slate-400 text-sm mb-2">Total Listings</p>
              <p className="text-3xl font-bold text-white">{listings.length}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <p className="text-slate-400 text-sm mb-2">Revenue</p>
              <p className="text-3xl font-bold text-white">₹{totalRevenue.toLocaleString()}</p>
            </div>
          </div>

          {/* Listings Section */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Your Listings</h3>
            {listings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400">No listings yet. Create your first listing to get started!</p>
              </div>
            ) : (
              <ListingsTable listings={listings} />
            )}
          </div>
        </div>
      </div>

      {/* Add Listing Modal */}
      <AddListingModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} farmerId={user?.uid} />
    </div>
  )
}
