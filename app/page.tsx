"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Leaf, ShoppingCart, BarChart3, AlertCircle } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [firebaseError, setFirebaseError] = useState(false)

  useEffect(() => {
    if (!auth) {
      setFirebaseError(true)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/select-role")
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleGoogleLogin = async () => {
    if (!auth) {
      setFirebaseError(true)
      return
    }
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {firebaseError && (
          <div className="mb-8 bg-red-900/20 border border-red-700 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-400 mb-1">Configuration Error</h3>
              <p className="text-red-300 text-sm">
                Firebase is not properly configured. Please ensure all Firebase environment variables are set in your
                Vercel project settings.
              </p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Branding */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">AgroConnect</h1>
              </div>
              <p className="text-slate-400 text-lg">
                Connecting farmers, buyers, and aggregators in one unified platform
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <Leaf className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white mb-1">For Farmers</h3>
                  <p className="text-slate-400 text-sm">List your vegetables and reach bulk buyers directly</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <ShoppingCart className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white mb-1">For Buyers</h3>
                  <p className="text-slate-400 text-sm">Browse fresh produce from verified farmers</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <BarChart3 className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white mb-1">For Admins</h3>
                  <p className="text-slate-400 text-sm">Manage orders and aggregate supplies efficiently</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login */}
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome</h2>
            <p className="text-slate-400 mb-8">Sign in to your account to get started</p>

            <Button
              onClick={handleGoogleLogin}
              disabled={firebaseError}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-6 rounded-lg font-semibold mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {firebaseError ? "Configuration Error" : "Sign in with Google"}
            </Button>

            <p className="text-xs text-slate-500 text-center">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
