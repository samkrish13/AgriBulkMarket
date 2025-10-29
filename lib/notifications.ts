import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp, query, where, onSnapshot } from "firebase/firestore"

export interface Notification {
  id: string
  userId: string
  type: "order_placed" | "order_approved" | "order_declined" | "order_delivered" | "listing_sold"
  title: string
  message: string
  read: boolean
  createdAt: Date
  relatedId?: string
}

export async function createNotification(
  userId: string,
  type: Notification["type"],
  title: string,
  message: string,
  relatedId?: string,
) {
  try {
    await addDoc(collection(db, "notifications"), {
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: serverTimestamp(),
      relatedId,
    })
  } catch (error) {
    console.error("Error creating notification:", error)
  }
}

export function subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
  const q = query(collection(db, "notifications"), where("userId", "==", userId))

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Notification[]

    callback(notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
  })
}
