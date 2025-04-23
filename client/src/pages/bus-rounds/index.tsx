import { useQuery } from "@tanstack/react-query";
import { BusRound, Bus } from "@shared/schema";
import { Link } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { 
  Calendar, 
  Clock, 
  Edit, 
  MapPin, 
  PlayCircle, 
  Plus, 
  StopCircle, 
  Trash2 
} from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BusRoundsIndex() {
  const { toast } = useToast();
  const [roundToDelete, setRoundToDelete] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Fetch bus rounds
  const { data: busRounds, isLoading } = useQuery<BusRound[]>({
    queryKey: ["/api/bus-rounds"],
  });

  // Fetch buses for linking bus numbers
  const { data: buses } = useQuery<Bus[]>({
    queryKey: ["/api/buses"],
  });

  // Filtered rounds based on status and type
  const filteredRounds = busRounds?.filter(round => {
    const statusMatch = statusFilter === "all" || round.status === statusFilter;
    const typeMatch = typeFilter === "all" || round.type === typeFilter;
    return statusMatch && typeMatch;
  });

  // Start round function
  const startRound = async (roundId: number) => {
    try {
      await apiRequest("POST", `/api/bus-rounds/${roundId}/start`, {});
      queryClient.invalidateQueries({ queryKey: ["/api/bus-rounds"] });
      toast({
        title: "Round started",
        description: "The bus round has been started successfully.",
      });
    } catch (error) {
      toast({
        title: "Error starting round",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  // Stop round function
  const stopRound = async (roundId: number) => {
    try {
      await apiRequest("POST", `/api/bus-rounds/${roundId}/stop`, {});
      queryClient.invalidateQueries({ queryKey: ["/api/bus-rounds"] });
      toast({
        title: "Round completed",
        description: "The bus round has been marked as completed.",
      });
    } catch (error) {
      toast({
        title: "Error stopping round",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  // Delete round function
  const handleDeleteRound = async () => {
    if (!roundToDelete) return;
    
    try {
      await apiRequest("DELETE", `/api/bus-rounds/${roundToDelete}`);
      
      // Invalidate bus rounds query to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/bus-rounds"] });
      
      toast({
        title: "Bus round deleted",
        description: "The bus round has been successfully deleted.",
      });
      
      setRoundToDelete(null);
    } catch (error) {
      toast({
        title: "Error deleting bus round",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  // Get bus number from busId
  const getBusNumber = (busId: number) => {
    const bus = buses?.find(bus => bus.id === busId);
    return bus ? `Bus #${bus.busNumber}` : `Bus ID: ${busId}`;
  };

  // Bus round table columns
  const columns: ColumnDef<BusRound>[] = [
    {
      accessorKey: "name",
      header: "Round Name",
      cell: ({ row }) => {
        const round = row.original;
        const isPending = round.status === "pending";
        const isInProgress = round.status === "in_progress";
        const isCompleted = round.status === "completed";
        
        let iconColor = "text-neutral-400";
        if (isInProgress) iconColor = "text-success-500";
        if (isCompleted) iconColor = "text-primary-500";
        
        return (
          <div className="flex items-center">
            <div className={`h-8 w-8 rounded-md flex items-center justify-center mr-3 ${
              round.type === "morning" 
                ? "bg-primary-100 text-primary-700" 
                : "bg-secondary-500 bg-opacity-10 text-secondary-500"
            }`}>
              {round.type === "morning" ? "AM" : "PM"}
            </div>
            <div>
              <div className="font-medium flex items-center">
                {round.name}
                {isInProgress && (
                  <Badge className="ml-2 bg-success-500">In Progress</Badge>
                )}
                {isPending && (
                  <Badge className="ml-2" variant="secondary">Pending</Badge>
                )}
                {isCompleted && (
                  <Badge className="ml-2" variant="outline">Completed</Badge>
                )}
              </div>
              <div className="text-xs text-neutral-500">
                {getBusNumber(round.busId)}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant={row.original.type === "morning" ? "default" : "secondary"}>
          {row.original.type === "morning" ? "Morning" : "Afternoon"}
        </Badge>
      ),
    },
    {
      accessorKey: "schedule",
      header: "Schedule",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-neutral-400" />
          <span>
            {row.original.startTime} - {row.original.endTime}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "studentsCount",
      header: "Students",
      cell: ({ row }) => {
        // In a real implementation, we would fetch the students count
        // For now, we'll use a random number as a placeholder
        const studentsCount = Math.floor(Math.random() * 35) + 15;
        
        return (
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-neutral-400" />
            <span>{studentsCount} students</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const round = row.original;
        const isPending = round.status === "pending";
        const isInProgress = round.status === "in_progress";
        
        return (
          <div className="flex space-x-2">
            {isPending && (
              <Button 
                variant="outline" 
                size="sm"
                className="text-success-600 border-success-600 hover:bg-success-50"
                onClick={() => startRound(round.id)}
              >
                <PlayCircle className="h-4 w-4 mr-1" />
                Start
              </Button>
            )}
            
            {isInProgress && (
              <Button 
                variant="outline" 
                size="sm"
                className="text-amber-600 border-amber-600 hover:bg-amber-50"
                onClick={() => stopRound(round.id)}
              >
                <StopCircle className="h-4 w-4 mr-1" />
                Complete
              </Button>
            )}
            
            <Link href={`/bus-rounds/${round.id}`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </Link>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-500 border-red-500 hover:bg-red-50"
                  onClick={() => setRoundToDelete(round.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the
                    bus round and remove all student assignments.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setRoundToDelete(null)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteRound}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
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
              <h1 className="text-2xl font-heading font-bold text-neutral-900">Bus Rounds</h1>
              <p className="text-neutral-500">Manage morning and afternoon bus rounds</p>
            </div>
            <Link href="/bus-rounds/new">
              <Button className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Create New Round
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col md:flex-row justify-between mb-6">
              <div className="mb-4 md:mb-0">
                <Tabs value={typeFilter} onValueChange={setTypeFilter}>
                  <TabsList>
                    <TabsTrigger value="all">All Rounds</TabsTrigger>
                    <TabsTrigger value="morning">Morning</TabsTrigger>
                    <TabsTrigger value="afternoon">Afternoon</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div>
                <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                  <TabsList>
                    <TabsTrigger value="all">All Status</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">Loading bus rounds...</div>
            ) : filteredRounds && filteredRounds.length > 0 ? (
              <DataTable 
                columns={columns} 
                data={filteredRounds} 
                searchField="name"
                searchPlaceholder="Search rounds..."
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-neutral-500 mb-4">No bus rounds found with the selected filters</p>
                <Link href="/bus-rounds/new">
                  <Button>Create your first bus round</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
