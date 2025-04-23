import { useQuery } from "@tanstack/react-query";
import { Notification } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Bell, CheckCircle, Clock, AlertTriangle, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";

// Format notification timestamp
function formatTime(timestamp: Date) {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString();
}

// Get icon based on notification type
function getNotificationIcon(type: string) {
  switch (type) {
    case "arrival":
    case "round_completed":
      return <CheckCircle className="h-5 w-5 text-success-500" />;
    case "will_arrive":
    case "round_started":
      return <Clock className="h-5 w-5 text-secondary-500" />;
    case "delay":
      return <AlertTriangle className="h-5 w-5 text-danger-500" />;
    case "location_update":
      return <MapPin className="h-5 w-5 text-primary-500" />;
    case "absent":
      return <AlertTriangle className="h-5 w-5 text-danger-500" />;
    default:
      return <Bell className="h-5 w-5 text-neutral-500" />;
  }
}

// Get border color based on notification type
function getBorderColor(type: string) {
  switch (type) {
    case "arrival":
    case "round_completed":
      return "border-success-500";
    case "will_arrive":
    case "round_started":
      return "border-secondary-500";
    case "delay":
      return "border-danger-500";
    case "location_update":
      return "border-primary-500";
    case "absent":
      return "border-danger-500";
    default:
      return "border-neutral-400";
  }
}

// Notification item component
function NotificationItem({ notification }: { notification: Notification }) {
  return (
    <div
      className={cn(
        "p-2 hover:bg-neutral-50 rounded-md transition-colors border-l-4",
        getBorderColor(notification.type)
      )}
    >
      <div className="flex mb-1">
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-neutral-900">
            {notification.message}
          </p>
          <div className="text-xs text-neutral-500 mt-0.5">
            {formatTime(new Date(notification.timestamp))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationsList() {
  // Fetch notifications
  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  // Mock notifications for demonstration
  const mockNotifications = [
    {
      id: 1,
      type: "arrival",
      message: "Bus #101 arrived at school",
      timestamp: new Date(),
      roundId: 1,
      busId: 1,
    },
    {
      id: 2,
      type: "will_arrive",
      message: "Bus #203 will arrive soon",
      timestamp: new Date(Date.now() - 5 * 60000),
      roundId: 2,
      busId: 2,
    },
    {
      id: 3,
      type: "absent",
      message: "Emma Davis marked absent",
      timestamp: new Date(Date.now() - 10 * 60000),
      roundId: null,
      busId: null,
      studentId: 5,
    },
    {
      id: 4,
      type: "delay",
      message: "Bus #315 delay notification",
      timestamp: new Date(Date.now() - 20 * 60000),
      roundId: 3,
      busId: 3,
    },
    {
      id: 5,
      type: "round_started",
      message: "Morning Round #101 started",
      timestamp: new Date(Date.now() - 60 * 60000),
      roundId: 1,
      busId: 1,
    },
    {
      id: 6,
      type: "user",
      message: "New parent account created",
      timestamp: new Date(Date.now() - 24 * 60 * 60000),
      roundId: null,
      busId: null,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm h-full">
      <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
        <h2 className="font-medium text-lg text-neutral-900">
          Recent Notifications
        </h2>
        <Link href="/notifications">
          <Button
            variant="link"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View All
          </Button>
        </Link>
      </div>
      <div className="p-2">
        {isLoading ? (
          <div className="p-4 text-center">Loading notifications...</div>
        ) : notifications && notifications.length > 0 ? (
          notifications
            .slice(0, 6)
            .map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
        ) : (
          // Display mock notifications for demo
          mockNotifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification as Notification} />
          ))
        )}
      </div>
    </div>
  );
}
