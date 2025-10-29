"use client"

import { CheckCircle2, Clock, AlertCircle } from "lucide-react"

interface TimelineEvent {
  status: string
  timestamp?: Date
  completed: boolean
}

interface OrderTimelineProps {
  status: "Pending Approval" | "Approved" | "Declined" | "Placed" | "Delivered"
  createdAt: Date
  approvedAt?: Date
  placedAt?: Date
  deliveredAt?: Date
}

export function OrderTimeline({ status, createdAt, approvedAt, placedAt, deliveredAt }: OrderTimelineProps) {
  const events: TimelineEvent[] = [
    {
      status: "Order Placed",
      timestamp: createdAt,
      completed: true,
    },
    {
      status: "Pending Approval",
      timestamp: createdAt,
      completed: status !== "Pending Approval" && status !== "Declined",
    },
    {
      status: "Approved",
      timestamp: approvedAt,
      completed: status === "Approved" || status === "Placed" || status === "Delivered",
    },
    {
      status: "Placed",
      timestamp: placedAt,
      completed: status === "Placed" || status === "Delivered",
    },
    {
      status: "Delivered",
      timestamp: deliveredAt,
      completed: status === "Delivered",
    },
  ]

  const isDeclined = status === "Declined"

  return (
    <div className="space-y-4">
      {events.map((event, idx) => (
        <div key={idx} className="flex gap-4">
          {/* Timeline Dot */}
          <div className="flex flex-col items-center">
            {event.completed ? (
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            ) : isDeclined && idx > 1 ? (
              <AlertCircle className="w-6 h-6 text-red-400" />
            ) : (
              <Clock className="w-6 h-6 text-slate-500" />
            )}
            {idx < events.length - 1 && (
              <div
                className={`w-1 h-8 mt-2 ${
                  event.completed ? "bg-green-400" : isDeclined && idx > 1 ? "bg-red-400" : "bg-slate-600"
                }`}
              />
            )}
          </div>

          {/* Event Details */}
          <div className="pb-4">
            <p className={`font-semibold ${event.completed ? "text-white" : "text-slate-400"}`}>{event.status}</p>
            {event.timestamp && <p className="text-xs text-slate-500">{event.timestamp.toLocaleString()}</p>}
          </div>
        </div>
      ))}

      {isDeclined && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm font-medium">Order Declined</p>
          <p className="text-red-400/80 text-xs mt-1">Please contact support for more information</p>
        </div>
      )}
    </div>
  )
}
