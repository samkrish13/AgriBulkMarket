import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, updateDoc, getDoc } from "firebase/firestore"
import { createNotification } from "@/lib/notifications"

export async function POST(request: NextRequest) {
  try {
    const { orderId, reason } = await request.json()

    // Get order details
    const orderDoc = await getDoc(doc(db, "orders", orderId))
    if (!orderDoc.exists()) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const orderData = orderDoc.data()

    // Update order status
    await updateDoc(doc(db, "orders", orderId), {
      status: "Declined",
      declineReason: reason,
    })

    // Send notification to buyer
    await createNotification(
      orderData.buyerId,
      "order_declined",
      "Order Declined",
      `Your order has been declined. Reason: ${reason}`,
      orderId,
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Order decline error:", error)
    return NextResponse.json({ error: "Failed to decline order" }, { status: 500 })
  }
}
