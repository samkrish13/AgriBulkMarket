"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Leaf } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/select-role")
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      router.push("/select-role")
    } catch (error) {
      console.error("Login error:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 space-y-8">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">AgroConnect</h1>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Sign In</h2>
            <p className="text-slate-400">Continue with your Google account</p>
          </div>

          <Button
            onClick={handleGoogleSignIn}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-6 rounded-lg font-semibold"
          >
            Sign in with Google
          </Button>

          <p className="text-xs text-slate-500 text-center">We use Google Sign-In to keep your account secure</p>
        </div>
      </div>
    </div>
  )
}
