import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Notification, BusRound, Bus, User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { 
  AlertTriangle, 
  BellRing, 
  CheckCircle, 
  Clock, 
  Filter, 
  Loader2, 
  MapPin, 
  RefreshCw, 
  Send, 
  User as UserIcon 
} from "lucide-react";

// Notification type icons
function getNotificationIcon(type: string) {
  switch (type) {
    case "arrival":
    case "round_completed":
      return <CheckCircle className="h-5 w-5 text-success-500" />;
    case "will_arrive":
    case "round_started":
      return <Clock className="h-5 w-5 text-secondary-500" />;
    case "delay":
      return <AlertTriangle className="h-5 w-5 text-destructive" />;
    case "location_update":
      return <MapPin className="h-5 w-5 text-primary-500" />;
    case "absent":
      return <AlertTriangle className="h-5 w-5 text-destructive" />;
    case "student_on_bus":
    case "student_off_bus":
      return <UserIcon className="h-5 w-5 text-primary-500" />;
    default:
      return <BellRing className="h-5 w-5 text-neutral-500" />;
  }
}

// Border color based on notification type
function getNotificationBorderColor(type: string) {
  switch (type) {
    case "arrival":
    case "round_completed":
      return "border-success-500";
    case "will_arrive":
    case "round_started":
      return "border-secondary-500";
    case "delay":
      return "border-destructive";
    case "location_update":
      return "border-primary-500";
    case "absent":
      return "border-destructive";
    case "student_on_bus":
    case "student_off_bus":
      return "border-primary-500";
    default:
      return "border-neutral-400";
  }
}

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

// Notification form schema
const notificationSchema = z.object({
  type: z.string().min(1, "Notification type is required"),
  message: z.string().min(5, "Message is required"),
  roundId: z.number().optional(),
  busId: z.number().optional(),
  recipientId: z.number().optional(),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

// Individual notification component
function NotificationItem({ notification }: { notification: Notification }) {
  return (
    <div className={`p-4 bg-white rounded-md shadow-sm mb-4 border-l-4 ${getNotificationBorderColor(notification.type)}`}>
      <div className="flex items-start">
        <div className="mr-4 mt-1">{getNotificationIcon(notification.type)}</div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-medium">{notification.message}</h3>
            <span className="text-xs text-neutral-500">
              {formatTime(new Date(notification.timestamp))}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-neutral-500">
            {notification.roundId && (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-neutral-100">
                Round ID: {notification.roundId}
              </span>
            )}
            {notification.busId && (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-neutral-100">
                Bus ID: {notification.busId}
              </span>
            )}
            {notification.studentId && (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-neutral-100">
                Student ID: {notification.studentId}
              </span>
            )}
            {notification.senderId && (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-neutral-100">
                Sent by: ID {notification.senderId}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Notifications() {
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch notifications
  const { data: notifications, isLoading, refetch } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  // Fetch active rounds for notification sending
  const { data: activeRounds } = useQuery<BusRound[]>({
    queryKey: ["/api/bus-rounds?status=in_progress"],
  });

  // Fetch buses
  const { data: buses } = useQuery<Bus[]>({
    queryKey: ["/api/buses"],
  });

  // Fetch parents
  const { data: parents } = useQuery<User[]>({
    queryKey: ["/api/users?role=parent"],
  });

  // Filter notifications based on type
  const filteredNotifications = notifications?.filter(notification => {
    if (filter === "all") return true;
    return notification.type.includes(filter);
  });

  // Set up form for sending notifications
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      type: "",
      message: "",
      roundId: undefined,
      busId: undefined,
      recipientId: undefined,
    },
  });

  // Handle refreshing notifications
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    toast({
      title: "Notifications refreshed",
      description: "Latest notifications have been loaded.",
    });
  };

  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: async (data: NotificationFormValues) => {
      return apiRequest("POST", "/api/notifications", data);
    },
    onSuccess: () => {
      toast({
        title: "Notification sent",
        description: "Your notification has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error sending notification",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: NotificationFormValues) => {
    sendNotificationMutation.mutate(data);
  };

  // Get type options for notification form
  const notificationTypeOptions = [
    { value: "arrival", label: "Arrival" },
    { value: "will_arrive", label: "Will Arrive Soon" },
    { value: "student_on_bus", label: "Student On Bus" },
    { value: "student_off_bus", label: "Student Off Bus" },
    { value: "delay", label: "Delay" },
    { value: "round_started", label: "Round Started" },
    { value: "round_completed", label: "Round Completed" },
    { value: "arrived_to_school", label: "Arrived to School" },
    { value: "general", label: "General Message" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Sidebar />
      <div className="lg:ml-64 flex-1 min-h-screen">
        <Header />

        {/* Main Content */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-heading font-bold text-neutral-900">Notifications</h1>
              <p className="text-neutral-500">Manage and send notifications to buses and parents</p>
            </div>
            <Button 
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="flex items-center"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>

          <Tabs defaultValue="notifications">
            <TabsList className="mb-6">
              <TabsTrigger value="notifications">Notification History</TabsTrigger>
              <TabsTrigger value="send">Send Notification</TabsTrigger>
            </TabsList>

            <TabsContent value="notifications">
              <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm font-medium">Filter by type:</span>
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Notifications</SelectItem>
                      <SelectItem value="arrival">Arrivals</SelectItem>
                      <SelectItem value="round">Bus Rounds</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                      <SelectItem value="delay">Delays</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                  </div>
                ) : filteredNotifications && filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BellRing className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                    <h3 className="font-medium text-lg mb-2">No notifications found</h3>
                    <p className="text-neutral-500 text-sm">
                      {filter === "all" 
                        ? "There are no notifications yet." 
                        : "No notifications match the selected filter."}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="send">
              <Card>
                <CardHeader>
                  <CardTitle>Send New Notification</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form 
                      onSubmit={form.handleSubmit(onSubmit)} 
                      className="space-y-6"
                    >
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notification Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select notification type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {notificationTypeOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="roundId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bus Round (Optional)</FormLabel>
                              <Select
                                onValueChange={(value) => field.onChange(parseInt(value))}
                                defaultValue={field.value?.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select bus round" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  {activeRounds?.map(round => (
                                    <SelectItem key={round.id} value={round.id.toString()}>
                                      {round.name} ({round.type === "morning" ? "AM" : "PM"})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="busId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bus (Optional)</FormLabel>
                              <Select
                                onValueChange={(value) => field.onChange(parseInt(value))}
                                defaultValue={field.value?.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select bus" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  {buses?.map(bus => (
                                    <SelectItem key={bus.id} value={bus.id.toString()}>
                                      Bus #{bus.busNumber}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="recipientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Recipient (Optional)</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(parseInt(value))}
                              defaultValue={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select recipient" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="parents">All Parents</SelectItem>
                                <SelectItem value="drivers">All Drivers</SelectItem>
                                {parents?.map(parent => (
                                  <SelectItem key={parent.id} value={parent.id.toString()}>
                                    {parent.fullName} (Parent)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter notification message"
                                className="resize-none h-24"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={sendNotificationMutation.isPending}
                          className="px-6"
                        >
                          {sendNotificationMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Send Notification
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
