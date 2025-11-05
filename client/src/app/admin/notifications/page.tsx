import HeaderBox from "@/components/common/HeaderBox"
import CreateNotificationDialog from "@/components/admin/notifications/CreateNotificationDialog"
import { NotificationsTable } from "@/components/admin/notifications/Notificationstable"
import { columns, type NotificationLogEntry } from "@/components/admin/notifications/Columns"
import { mockNotifications, mockInvestmentCycles, mockUsers } from "@/db"

const NotificationsPage = () => {
  // Transform notifications into log entries with resolved names
  const notificationLog: NotificationLogEntry[] = mockNotifications.map((notification) => {
    const sentByUser = mockUsers.find((u) => u.id === notification.userId)
    
    // In a real app, you'd determine recipient group from notification metadata
    // For now, we'll mock it based on the notification content
    const recipientGroup = "All Users" // This would be stored in the notification
    const totalRecipients = mockUsers.length // This would be calculated

    return {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      recipientGroup,
      sentBy: sentByUser?.fullName || "System",
      sentAt: notification.createdAt,
      link: notification.link,
      totalRecipients,
    }
  })

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <HeaderBox
          title="Notifications"
          subtext="Broadcast important updates to users"
        />
        <div className="w-full sm:w-auto">
          <CreateNotificationDialog 
            cycles={mockInvestmentCycles}
            users={mockUsers}
          />
        </div>
      </div>

      <NotificationsTable columns={columns} data={notificationLog} />
    </div>
  )
}

export default NotificationsPage