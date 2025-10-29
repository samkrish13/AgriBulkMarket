import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, updateDoc, getDoc } from "firebase/firestore"
import { createNotification } from "@/lib/notifications"

export async function POST(request: NextRequest) {
  try {
    const { orderId, adminEmail } = await request.json()

    // Get order details
    const orderDoc = await getDoc(doc(db, "orders", orderId))
    if (!orderDoc.exists()) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const orderData = orderDoc.data()

    // Generate Google Meet link
    const meetResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/google/meet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        buyerEmail: orderData.buyerEmail,
        adminEmail,
      }),
    })

    let meetLink = null
    if (meetResponse.ok) {
      const meetData = await meetResponse.json()
      meetLink = meetData.meetLink
    }

    // Update order status
    await updateDoc(doc(db, "orders", orderId), {
      status: "Approved",
      meetLink,
    })

    // Send notification to buyer
    await createNotification(
      orderData.buyerId,
      "order_approved",
      "Order Approved",
      `Your order has been approved. Join the meeting to verify details.`,
      orderId,
    )

    return NextResponse.json({
      success: true,
      meetLink,
    })
  } catch (error) {
    console.error("Order approval error:", error)
    return NextResponse.json({ error: "Failed to approve order" }, { status: 500 })
  }
}
