"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { ShoppingCart, LogOut, Check } from "lucide-react"
import { PlanCard } from "@/components/buyer/plan-card"
import { initializeRazorpayPayment, updateSubscriptionAfterPayment } from "@/app/actions/razorpay"

interface Plan {
  id: string
  name: string
  price: number
  orderLimit: number
  discount: number
  features: string[]
}

const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 999,
    orderLimit: 5,
    discount: 0,
    features: ["Up to 5 orders/month", "Standard support", "No discounts"],
  },
  {
    id: "standard",
    name: "Standard",
    price: 2999,
    orderLimit: 20,
    discount: 5,
    features: ["Up to 20 orders/month", "Priority support", "5% discount on orders", "Order history"],
  },
  {
    id: "premium",
    name: "Premium",
    price: 5999,
    orderLimit: 100,
    discount: 15,
    features: ["Unlimited orders", "24/7 dedicated support", "15% discount on orders", "Advanced analytics"],
  },
]

export default function PlansPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)

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
      setCurrentPlan(userDoc.data().subscriptionPlan || null)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await signOut(auth)
    router.push("/")
  }

  const handleSubscribe = async (planId: string) => {
    if (!user) return

    setProcessingPlan(planId)

    try {
      const plan = PLANS.find((p) => p.id === planId)
      if (!plan) return

      const razorpayOptions = await initializeRazorpayPayment({
        planId: plan.id,
        planName: plan.name,
        planPrice: plan.price,
        userEmail: user.email,
        userName: user.displayName,
        userId: user.uid,
      })

      // Initialize Razorpay
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      document.body.appendChild(script)

      script.onload = () => {
        const options = {
          ...razorpayOptions,
          handler: async (response: any) => {
            try {
              await updateSubscriptionAfterPayment(
                user.uid,
                planId,
                plan.price,
                plan.discount,
                plan.orderLimit,
                response.razorpay_payment_id,
              )

              setCurrentPlan(planId)
              alert("Subscription successful!")
              router.push("/buyer/dashboard")
            } catch (error) {
              console.error("Error updating subscription:", error)
              alert("Subscription recorded but failed to update profile. Please contact support.")
            }
          },
        }

        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      }
    } catch (error) {
      console.error("Error processing subscription:", error)
      alert("Failed to process subscription. Please try again.")
    } finally {
      setProcessingPlan(null)
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
          <div className="px-4 py-2 rounded-lg hover:bg-slate-700 cursor-pointer">
            <p className="text-sm text-slate-400">My Orders</p>
          </div>
          <div className="px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/50">
            <p className="text-sm font-semibold text-blue-400">Plans</p>
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
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">Subscription Plans</h2>
            <p className="text-slate-400">Choose a plan that fits your business needs</p>
            {currentPlan && (
              <p className="text-blue-400 mt-2">
                Current Plan: <span className="font-semibold capitalize">{currentPlan}</span>
              </p>
            )}
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={currentPlan === plan.id}
                isProcessing={processingPlan === plan.id}
                onSubscribe={() => handleSubscribe(plan.id)}
              />
            ))}
          </div>

          {/* Info Section */}
          <div className="mt-12 bg-slate-800 rounded-xl border border-slate-700 p-8">
            <h3 className="text-xl font-bold text-white mb-4">Plan Details</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold text-white mb-3">Basic Plan</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Perfect for small businesses
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Limited orders per month
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Standard support
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">Standard Plan</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Growing businesses
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    5% discount on orders
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Priority support
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">Premium Plan</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Enterprise solutions
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    15% discount on orders
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    24/7 dedicated support
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
