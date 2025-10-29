"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { ShoppingCart, LogOut, Leaf } from "lucide-react"
import { CatalogGrid } from "@/components/buyer/catalog-grid"
import { CartSidebar } from "@/components/buyer/cart-sidebar"

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
  createdAt: Date
}

interface CartItem extends Listing {
  cartQuantity: number
}

export default function BuyerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState<Listing[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)

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

      // Subscribe to available listings
      const q = query(collection(db, "listings"), where("status", "==", "Available"))
      const unsubscribeListings = onSnapshot(q, async (snapshot) => {
        const listingsData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const farmerDoc = await getDoc(doc(db, "users", doc.data().farmerId))
            return {
              id: doc.id,
              ...doc.data(),
              farmerName: farmerDoc.data()?.name || "Unknown Farmer",
              createdAt: doc.data().createdAt?.toDate(),
            }
          }),
        )
        setListings(listingsData as Listing[])
        setLoading(false)
      })

      return () => unsubscribeListings()
    })

    return () => unsubscribe()
  }, [router])

  const handleAddToCart = (listing: Listing, quantity: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === listing.id)
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === listing.id ? { ...item, cartQuantity: item.cartQuantity + quantity } : item,
        )
      }
      return [...prevCart, { ...listing, cartQuantity: quantity }]
    })
  }

  const handleRemoveFromCart = (listingId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== listingId))
  }

  const handleUpdateCartQuantity = (listingId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(listingId)
    } else {
      setCart((prevCart) =>
        prevCart.map((item) => (item.id === listingId ? { ...item, cartQuantity: quantity } : item)),
      )
    }
  }

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

  const cartTotal = cart.reduce((sum, item) => sum + item.cartQuantity * item.pricePerUnit, 0)

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
          <div className="px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/50">
            <p className="text-sm font-semibold text-blue-400">Dashboard</p>
          </div>
          <div className="px-4 py-2 rounded-lg hover:bg-slate-700 cursor-pointer">
            <p className="text-sm text-slate-400">Browse Catalog</p>
          </div>
          <div className="px-4 py-2 rounded-lg hover:bg-slate-700 cursor-pointer">
            <p className="text-sm text-slate-400">My Orders</p>
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome, {user?.displayName}</h2>
              <p className="text-slate-400">Browse fresh produce and place bulk orders</p>
            </div>
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-white" />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </div>

          {/* Dashboard Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <p className="text-slate-400 text-sm mb-2">Available Products</p>
              <p className="text-3xl font-bold text-white">{listings.length}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <p className="text-slate-400 text-sm mb-2">Cart Items</p>
              <p className="text-3xl font-bold text-white">{cart.length}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <p className="text-slate-400 text-sm mb-2">Cart Total</p>
              <p className="text-3xl font-bold text-white">₹{cartTotal.toLocaleString()}</p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Catalog */}
            <div className="lg:col-span-3">
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-xl font-bold text-white mb-6">Available Produce</h3>
                {listings.length === 0 ? (
                  <div className="text-center py-12">
                    <Leaf className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No produce available yet. Check back soon!</p>
                  </div>
                ) : (
                  <CatalogGrid listings={listings} onAddToCart={handleAddToCart} />
                )}
              </div>
            </div>

            {/* Cart Sidebar */}
            {showCart && (
              <CartSidebar
                cart={cart}
                onRemoveFromCart={handleRemoveFromCart}
                onUpdateQuantity={handleUpdateCartQuantity}
                onClose={() => setShowCart(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
