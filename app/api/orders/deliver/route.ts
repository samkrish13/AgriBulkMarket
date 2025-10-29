import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, updateDoc, getDoc } from "firebase/firestore"
import { createNotification } from "@/lib/notifications"

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    // Get order details
    const orderDoc = await getDoc(doc(db, "orders", orderId))
    if (!orderDoc.exists()) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const orderData = orderDoc.data()

    // Update order status to Delivered
    await updateDoc(doc(db, "orders", orderId), {
      status: "Delivered",
      deliveredAt: new Date(),
    })

    // Update farmer listings to Sold
    for (const item of orderData.items) {
      const listingDoc = await getDoc(doc(db, "listings", item.listingId))
      if (listingDoc.exists()) {
        await updateDoc(doc(db, "listings", item.listingId), {
          status: "Sold",
        })
      }
    }

    // Send notifications
    const farmerIds = [...new Set(orderData.items.map((item: any) => item.farmerId))]
    for (const farmerId of farmerIds) {
      await createNotification(
        farmerId,
        "listing_sold",
        "Order Delivered",
        `Order ${orderId.slice(0, 8)} has been delivered`,
        orderId,
      )
    }

    await createNotification(
      orderData.buyerId,
      "order_delivered",
      "Order Delivered",
      "Your order has been successfully delivered",
      orderId,
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Order delivery error:", error)
    return NextResponse.json({ error: "Failed to mark order as delivered" }, { status: 500 })
  }
}
