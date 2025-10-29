import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { origins, destinations } = await request.json()

    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Missing Google Maps API key" }, { status: 500 })
    }

    const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json")
    url.searchParams.append("origins", origins)
    url.searchParams.append("destinations", destinations)
    url.searchParams.append("key", apiKey)

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.rows && data.rows[0] && data.rows[0].elements && data.rows[0].elements[0]) {
      const element = data.rows[0].elements[0]
      if (element.status === "OK") {
        const distanceInKm = element.distance.value / 1000
        const deliveryCharge = distanceInKm * 40 // ₹40 per km

        return NextResponse.json({
          distance: distanceInKm,
          deliveryCharge: Math.round(deliveryCharge),
        })
      }
    }

    return NextResponse.json({ error: "Unable to calculate distance" }, { status: 400 })
  } catch (error) {
    console.error("Distance calculation error:", error)
    return NextResponse.json({ error: "Distance calculation failed" }, { status: 500 })
  }
}
