"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Copy } from "lucide-react"
import { format } from "date-fns"

export interface NotificationLogEntry {
  id: number
  title: string
  message: string
  recipientGroup: string
  sentBy: string
  sentAt: Date
  link: string | null
  totalRecipients: number
}

export const columns: ColumnDef<NotificationLogEntry>[] = [
  {
    accessorKey: "sentAt",
    header: "Date Sent",
    cell: ({ row }) => {
      const date = row.getValue("sentAt") as Date
      return (
        <div className="min-w-[120px]">
          <div className="text-sm font-medium">
            {format(date, "MMM dd, yyyy")}
          </div>
          <div className="text-xs text-muted-foreground">
            {format(date, "h:mm a")}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="min-w-[200px]">
        <div className="font-medium text-sm">{row.getValue("title")}</div>
        <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[250px]">
          {row.original.message}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "recipientGroup",
    header: "Recipients",
    cell: ({ row }) => {
      const group = row.getValue("recipientGroup") as string
      const count = row.original.totalRecipients

      return (
        <div className="min-w-[150px]">
          <Badge variant="secondary" className="font-normal">
            {group}
          </Badge>
          <div className="text-xs text-muted-foreground mt-1">
            {count} {count === 1 ? "user" : "users"}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "sentBy",
    header: "Sent By",
    cell: ({ row }) => (
      <div className="text-sm hidden lg:table-cell">{row.getValue("sentBy")}</div>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const notification = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" />
              View Message
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Copy className="mr-2 h-4 w-4" />
              Duplicate as Template
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]