"use client"

import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

interface Plan {
  id: string
  name: string
  price: number
  orderLimit: number
  discount: number
  features: string[]
}

interface PlanCardProps {
  plan: Plan
  isCurrentPlan: boolean
  isProcessing: boolean
  onSubscribe: () => void
}

export function PlanCard({ plan, isCurrentPlan, isProcessing, onSubscribe }: PlanCardProps) {
  const isPopular = plan.id === "standard"

  return (
    <div
      className={`relative rounded-xl border overflow-hidden transition-all ${
        isPopular
          ? "border-blue-500 bg-slate-800 shadow-lg shadow-blue-500/20 scale-105"
          : "border-slate-700 bg-slate-800 hover:border-slate-600"
      }`}
    >
      {isPopular && (
        <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-xs font-bold py-1 text-center">
          MOST POPULAR
        </div>
      )}

      <div className={`p-8 ${isPopular ? "pt-12" : ""}`}>
        {/* Plan Name */}
        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>

        {/* Price */}
        <div className="mb-6">
          <span className="text-4xl font-bold text-white">₹{plan.price}</span>
          <span className="text-slate-400 ml-2">/month</span>
        </div>

        {/* Discount Badge */}
        {plan.discount > 0 && (
          <div className="mb-4 inline-block bg-green-500/20 border border-green-500/50 rounded-lg px-3 py-1">
            <p className="text-green-400 text-sm font-semibold">{plan.discount}% discount on orders</p>
          </div>
        )}

        {/* Order Limit */}
        <div className="mb-6 p-3 bg-slate-700 rounded-lg">
          <p className="text-slate-300 text-sm">
            {plan.orderLimit === 100 ? "Unlimited" : `Up to ${plan.orderLimit}`} orders/month
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-8">
          {plan.features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="text-slate-300 text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {/* Button */}
        <Button
          onClick={onSubscribe}
          disabled={isCurrentPlan || isProcessing}
          className={`w-full py-6 font-semibold ${
            isCurrentPlan
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : isPopular
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-slate-700 hover:bg-slate-600 text-white"
          }`}
        >
          {isCurrentPlan ? "Current Plan" : isProcessing ? "Processing..." : "Subscribe Now"}
        </Button>
      </div>
    </div>
  )
}
