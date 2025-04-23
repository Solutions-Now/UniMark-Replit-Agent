import { Bell, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Notification } from "@shared/schema";
import { cn } from "@/lib/utils";

export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch notifications
  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const hasUnreadNotifications = notifications && notifications.length > 0;

  return (
    <div className="bg-white shadow-sm h-16 flex items-center px-6 sticky top-0 z-10 lg:ml-64">
      <div className="flex items-center flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
          <Input
            type="text"
            placeholder="Search..."
            className="bg-neutral-100 rounded-md pl-10 pr-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="p-2 rounded-full hover:bg-neutral-100 relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            {hasUnreadNotifications && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-secondary-500 rounded-full"></span>
            )}
            <Bell className="h-6 w-6 text-neutral-700" />
          </Button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b border-neutral-200">
                <h3 className="text-sm font-medium">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications && notifications.length > 0 ? (
                  notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className="px-4 py-3 hover:bg-neutral-50 border-l-4 border-primary-500"
                    >
                      <p className="text-sm font-medium text-neutral-900">
                        {notification.message}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-neutral-600">
                    No new notifications
                  </div>
                )}
              </div>
              <div className="px-4 py-2 border-t border-neutral-200">
                <a
                  href="/notifications"
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  View all notifications
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <Button
          variant="ghost"
          size="icon"
          className="p-2 rounded-full hover:bg-neutral-100"
        >
          <Settings className="h-6 w-6 text-neutral-700" />
        </Button>
      </div>
    </div>
  );
}
