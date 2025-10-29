"use client"

import { useEffect, useState } from "react"
import { Bell, X } from "lucide-react"
import { subscribeToNotifications, type Notification } from "@/lib/notifications"

interface NotificationBellProps {
  userId: string
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showPanel, setShowPanel] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeToNotifications(userId, setNotifications)
    return () => unsubscribe()
  }, [userId])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 hover:bg-slate-700 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="absolute right-0 top-12 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h3 className="font-semibold text-white">Notifications</h3>
            <button onClick={() => setShowPanel(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-400">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-slate-700 hover:bg-slate-700/50 transition-colors cursor-pointer ${
                    !notification.read ? "bg-slate-700/30" : ""
                  }`}
                >
                  <p className="font-semibold text-white text-sm">{notification.title}</p>
                  <p className="text-slate-400 text-xs mt-1">{notification.message}</p>
                  <p className="text-slate-500 text-xs mt-2">{notification.createdAt?.toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
