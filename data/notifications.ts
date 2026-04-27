export interface Notification {
  id: string
  title: string
  description: string
  timestamp: string
  read: boolean
  type: "info" | "warning" | "success" | "error"
}

export const notificationsData: Notification[] = [
  {
    id: "1",
    title: "New deployment completed",
    description: "Production deployment v2.4.1 finished successfully.",
    timestamp: "2 min ago",
    read: false,
    type: "success",
  },
  {
    id: "2",
    title: "CPU usage alert",
    description: "Server us-east-1 CPU usage exceeded 90% threshold.",
    timestamp: "15 min ago",
    read: false,
    type: "warning",
  },
  {
    id: "3",
    title: "Database backup failed",
    description: "Scheduled backup for db-prod-01 failed. Retrying in 30 min.",
    timestamp: "1 hour ago",
    read: false,
    type: "error",
  },
  {
    id: "4",
    title: "New team member joined",
    description: "Sofia Davis has been added to the Engineering team.",
    timestamp: "3 hours ago",
    read: true,
    type: "info",
  },
  {
    id: "5",
    title: "SSL certificate renewed",
    description: "Certificate for *.cerbrec.com renewed. Expires Dec 2027.",
    timestamp: "5 hours ago",
    read: true,
    type: "success",
  },
  {
    id: "6",
    title: "Storage usage warning",
    description: "Storage volume vol-0a1b2c is at 85% capacity.",
    timestamp: "8 hours ago",
    read: true,
    type: "warning",
  },
  {
    id: "7",
    title: "Monthly report ready",
    description: "Your November infrastructure report is ready to download.",
    timestamp: "1 day ago",
    read: true,
    type: "info",
  },
]
