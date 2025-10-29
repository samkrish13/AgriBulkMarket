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

    // Update order status to Placed
    await updateDoc(doc(db, "orders", orderId), {
      status: "Placed",
      placedAt: new Date(),
    })

    // Update farmer listings to Reserved/Sold
    for (const item of orderData.items) {
      const listingDoc = await getDoc(doc(db, "listings", item.listingId))
      if (listingDoc.exists()) {
        const currentQuantity = listingDoc.data().quantity
        const remainingQuantity = currentQuantity - item.quantity

        if (remainingQuantity <= 0) {
          await updateDoc(doc(db, "listings", item.listingId), {
            status: "Sold",
            soldQuantity: item.quantity,
          })
        } else {
          await updateDoc(doc(db, "listings", item.listingId), {
            quantity: remainingQuantity,
            status: "Reserved",
            reservedQuantity: item.quantity,
          })
        }
      }
    }

    // Send notifications to farmers
    const farmerIds = [...new Set(orderData.items.map((item: any) => item.farmerId))]
    for (const farmerId of farmerIds) {
      await createNotification(
        farmerId,
        "listing_sold",
        "Order Placed",
        `Your produce has been included in order ${orderId.slice(0, 8)}`,
        orderId,
      )
    }

    // Send notification to buyer
    await createNotification(
      orderData.buyerId,
      "order_delivered",
      "Order Placed",
      "Your order has been placed and is being prepared for delivery",
      orderId,
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Order placement error:", error)
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 })
  }
}
