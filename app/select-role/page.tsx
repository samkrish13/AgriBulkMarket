"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Leaf, ShoppingCart, BarChart3 } from "lucide-react"

type Role = "farmer" | "buyer" | "admin"

export default function SelectRolePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login")
        return
      }

      // Check if user already has a role
      const userDoc = await getDoc(doc(db, "users", currentUser.uid))
      if (userDoc.exists() && userDoc.data().role) {
        const role = userDoc.data().role
        router.push(`/${role}/dashboard`)
        return
      }

      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const handleRoleSelection = async (role: Role) => {
    if (!user) return

    try {
      setSelectedRole(role)
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          role,
          photoURL: user.photoURL,
          createdAt: new Date(),
        },
        { merge: true },
      )

      router.push(`/${role}/dashboard`)
    } catch (error) {
      console.error("Error setting role:", error)
      setSelectedRole(null)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">AgroConnect</h1>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-slate-400 border-slate-600 hover:bg-slate-700 bg-transparent"
          >
            Logout
          </Button>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome, {user?.displayName || "User"}</h2>
            <p className="text-slate-400">Select your role to get started</p>
          </div>

          {/* Role Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Farmer Card */}
            <button
              onClick={() => handleRoleSelection("farmer")}
              disabled={selectedRole === "farmer"}
              className="group relative bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-green-500 transition-all hover:shadow-lg hover:shadow-green-500/20 disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                  <Leaf className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Farmer</h3>
                  <p className="text-slate-400 text-sm">List your vegetables and manage inventory</p>
                </div>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>✓ Add vegetable listings</li>
                  <li>✓ Track orders</li>
                  <li>✓ Manage inventory</li>
                </ul>
              </div>
            </button>

            {/* Buyer Card */}
            <button
              onClick={() => handleRoleSelection("buyer")}
              disabled={selectedRole === "buyer"}
              className="group relative bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-4">
                <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <ShoppingCart className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Buyer</h3>
                  <p className="text-slate-400 text-sm">Browse and order fresh produce in bulk</p>
                </div>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>✓ Browse catalog</li>
                  <li>✓ Place orders</li>
                  <li>✓ Choose plans</li>
                </ul>
              </div>
            </button>

            {/* Admin Card */}
            <button
              onClick={() => handleRoleSelection("admin")}
              disabled={selectedRole === "admin"}
              className="group relative bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-orange-500 transition-all hover:shadow-lg hover:shadow-orange-500/20 disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-4">
                <div className="w-16 h-16 bg-orange-500/20 rounded-xl flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                  <BarChart3 className="w-8 h-8 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Admin</h3>
                  <p className="text-slate-400 text-sm">Manage orders and aggregate supplies</p>
                </div>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>✓ Review orders</li>
                  <li>✓ Approve/decline</li>
                  <li>✓ Manage fulfillment</li>
                </ul>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
