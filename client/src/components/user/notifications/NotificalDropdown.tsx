"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import type { Notification } from "@/db"
import { useRouter } from "next/navigation"

interface NotificationDropdownProps {
  notifications: Notification[]
  userId: number
}

const NotificationDropdown = ({ notifications, userId }: NotificationDropdownProps) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  // Filter notifications for current user
  const userNotifications = notifications.filter((n) => n.userId === userId)
  
  // Count unread notifications
  const unreadCount = userNotifications.filter((n) => !n.isRead).length

  // Sort by date, newest first
  const sortedNotifications = [...userNotifications].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read (in real app, this would be an API call)
    console.log("Mark as read:", notification.id)
    
    // Navigate to link if provided
    if (notification.link) {
      router.push(notification.link)
      setOpen(false)
    }
  }

  const handleMarkAllRead = () => {
    // In real app, this would be an API call
    console.log("Mark all as read for user:", userId)
  }

  const handleViewAll = () => {
    router.push("/notifications")
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative border-1 p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-emerald-500 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 hover:bg-red-600 text-white text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-[380px] sm:w-[420px] p-0 bg-white dark:bg-gray-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <h3 className="font-semibold text-base">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground">
                You have {unreadCount} unread {unreadCount === 1 ? "notification" : "notifications"}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs h-8"
            >
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {sortedNotifications.length > 0 ? (
          <>
            <ScrollArea className="h-[400px]">
              <div className="divide-y">
                {sortedNotifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors",
                      !notification.isRead && "bg-emerald-50/50 dark:bg-emerald-950/20"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Unread Indicator */}
                      {!notification.isRead && (
                        <div className="mt-2 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      )}
                      
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={cn(
                            "text-sm line-clamp-1",
                            !notification.isRead && "font-semibold"
                          )}>
                            {notification.title}
                          </h4>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        {notification.link && (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            Click to view →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t p-2">
              <Button
                variant="ghost"
                onClick={handleViewAll}
                className="w-full text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
              >
                View all notifications
              </Button>
            </div>
          </>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Bell className="w-12 h-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No notifications yet</p>
            <p className="text-xs text-muted-foreground text-center mt-1">
              We'll notify you when something important happens
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NotificationDropdown