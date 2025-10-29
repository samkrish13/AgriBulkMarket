import { type NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"

export async function POST(request: NextRequest) {
  try {
    const { orderId, buyerEmail, adminEmail } = await request.json()

    const credentials = {
      type: process.env.GOOGLE_SERVICE_ACCOUNT_TYPE,
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    }

    const auth = new google.auth.GoogleAuth({
      credentials: credentials as any,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    })

    const calendar = google.calendar({ version: "v3", auth })

    const event = {
      summary: `AgroConnect Order Meeting - ${orderId.slice(0, 8)}`,
      description: `Order verification meeting for order ${orderId}`,
      start: {
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        timeZone: "Asia/Kolkata",
      },
      attendees: [{ email: buyerEmail }, { email: adminEmail }],
      conferenceData: {
        createRequest: {
          requestId: orderId,
          conferenceSolutionKey: {
            key: "hangoutsMeet",
          },
        },
      },
    }

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event as any,
      conferenceDataVersion: 1,
    })

    const meetLink = response.data.conferenceData?.entryPoints?.[0]?.uri

    return NextResponse.json({
      meetLink,
      eventId: response.data.id,
    })
  } catch (error) {
    console.error("Google Meet creation error:", error)
    return NextResponse.json({ error: "Failed to create Google Meet link" }, { status: 500 })
  }
}
