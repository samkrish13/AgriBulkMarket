"use server"

import { db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"

interface RazorpayOptions {
  planId: string
  planName: string
  planPrice: number
  userEmail: string
  userName: string
  userId: string
}

export async function initializeRazorpayPayment(options: RazorpayOptions) {
  // This keeps the API key server-side and only returns the necessary options to the client

  const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

  if (!razorpayKeyId) {
    throw new Error("Razorpay key not configured")
  }

  return {
    key: razorpayKeyId,
    amount: options.planPrice * 100, // Amount in paise
    currency: "INR",
    name: "AgroConnect",
    description: `${options.planName} Plan Subscription`,
    prefill: {
      email: options.userEmail,
      name: options.userName,
    },
    theme: {
      color: "#3b82f6",
    },
  }
}

export async function updateSubscriptionAfterPayment(
  userId: string,
  planId: string,
  planPrice: number,
  planDiscount: number,
  planOrderLimit: number,
  razorpayPaymentId: string,
) {
  // This keeps all Firestore operations server-side

  try {
    await updateDoc(doc(db, "users", userId), {
      subscriptionPlan: planId,
      subscriptionPrice: planPrice,
      subscriptionDiscount: planDiscount,
      subscriptionOrderLimit: planOrderLimit,
      subscriptionStartDate: new Date(),
      razorpayPaymentId: razorpayPaymentId,
    })
    return { success: true }
  } catch (error) {
    console.error("Error updating subscription:", error)
    throw new Error("Failed to update subscription")
  }
}
