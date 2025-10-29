import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()

    const secret = process.env.RAZORPAY_KEY_SECRET

    if (!secret) {
      return NextResponse.json({ error: "Missing Razorpay secret" }, { status: 500 })
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex")

    if (expectedSignature === razorpay_signature) {
      return NextResponse.json({ verified: true })
    } else {
      return NextResponse.json({ verified: false }, { status: 400 })
    }
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
