import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BusRound, Bus, Location } from "@shared/schema";
import { useMap } from "@/hooks/use-map";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Navigation, 
  RefreshCw, 
  Users 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function LiveTracking() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
  const mapContainerId = "live-tracking-map";
  const { busMarkers, addBusMarker, updateBusPosition, isLoaded } = useMap(mapContainerId);

  // Get the round ID from URL if available
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const roundId = params.get("round");
    if (roundId) {
      setSelectedRoundId(roundId);
    }
  }, [location]);

  // Fetch active rounds
  const { data: activeRounds } = useQuery<BusRound[]>({
    queryKey: ["/api/bus-rounds?status=in_progress"],
  });

  // Fetch buses
  const { data: buses } = useQuery<Bus[]>({
    queryKey: ["/api/buses"],
  });

  // Fetch selected round details
  const { data: selectedRound } = useQuery<BusRound>({
    queryKey: [`/api/bus-rounds/${selectedRoundId}`],
    enabled: !!selectedRoundId,
  });

  // Fetch bus location
  const { data: busLocation, refetch: refetchLocation } = useQuery<Location>({
    queryKey: [`/api/buses/${selectedRound?.busId}/locations`],
    enabled: !!selectedRound?.busId,
    refetchInterval: 10000, // Refresh location every 10 seconds
  });

  // Handle bus selection
  const handleRoundSelect = (roundId: string) => {
    setSelectedRoundId(roundId);
    setLocation(`/live-tracking?round=${roundId}`, { replace: true });
  };

  // Manually refresh location data
  const handleRefreshLocation = () => {
    if (selectedRound?.busId) {
      refetchLocation();
      toast({
        title: "Refreshing location",
        description: "Getting the latest bus location data.",
      });
    }
  };

  // Simulate bus location update for demonstration purposes
  useEffect(() => {
    if (isLoaded && selectedRound && selectedRound.busId) {
      // For demonstration, we're using simulated coordinates
      const busId = selectedRound.busId;
      const lat = 37.7749 + (Math.random() * 0.02 - 0.01); // Random lat around San Francisco
      const lng = -122.4194 + (Math.random() * 0.02 - 0.01); // Random lng around San Francisco
      
      // Create a mock bus marker if it doesn't exist
      if (!busMarkers.some(marker => marker.id === busId)) {
        addBusMarker({
          id: busId,
          position: { lat, lng },
          label: `Bus #${getBusNumber(busId)}`,
          busNumber: getBusNumber(busId),
        });
      } else {
        // Update existing marker position
        updateBusPosition(busId, { lat, lng });
      }
    }
  }, [isLoaded, selectedRound, busLocation]);

  // Get bus number from busId
  function getBusNumber(busId: number): string {
    const bus = buses?.find(bus => bus.id === busId);
    return bus ? bus.busNumber : busId.toString();
  }

  // Get selected bus info
  const selectedBus = buses?.find(bus => bus.id === selectedRound?.busId);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Sidebar />
      <div className="lg:ml-64 flex-1 min-h-screen">
        <Header />

        {/* Main Content */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-heading font-bold text-neutral-900">Live Bus Tracking</h1>
              <p className="text-neutral-500">Track and monitor active bus rounds in real-time</p>
            </div>
            <div className="flex space-x-3">
              <Select
                value={selectedRoundId || ""}
                onValueChange={handleRoundSelect}
              >
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select an active round" />
                </SelectTrigger>
                <SelectContent>
                  {activeRounds?.length ? (
                    activeRounds.map((round) => (
                      <SelectItem key={round.id} value={round.id.toString()}>
                        {round.name} ({round.type === "morning" ? "AM" : "PM"})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      No active rounds available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Bus Info & Stats */}
            <div className="lg:col-span-1 space-y-6">
              {selectedRound ? (
                <>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Round Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-md ${
                            selectedRound.type === "morning" 
                              ? "bg-primary-100 text-primary-700" 
                              : "bg-secondary-500 bg-opacity-10 text-secondary-500"
                          }`}>
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">{selectedRound.name}</h3>
                            <p className="text-xs text-neutral-500">
                              {selectedRound.type === "morning" ? "Morning Round" : "Afternoon Round"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-md bg-neutral-100 text-neutral-600">
                            <Clock className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">Schedule</h3>
                            <p className="text-xs text-neutral-500">
                              {selectedRound.startTime} to {selectedRound.endTime}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-md bg-blue-100 text-blue-700">
                            <Navigation className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">Status</h3>
                            <Badge className="mt-1 bg-success-500">In Progress</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Bus Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-500">Bus Number:</span>
                          <span className="font-medium">#{selectedBus?.busNumber || "N/A"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-500">License:</span>
                          <span className="font-medium">{selectedBus?.licenseNumber || "N/A"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-500">Capacity:</span>
                          <span className="font-medium">{selectedBus?.capacity || "N/A"} seats</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-500">Driver:</span>
                          <span className="font-medium">
                            {/* In a real implementation, we would fetch driver data */}
                            {selectedRound.busId % 3 === 0 
                              ? "John Smith" 
                              : selectedRound.busId % 3 === 1 
                                ? "Emily Davis" 
                                : "Michael Brown"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Location Data</CardTitle>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={handleRefreshLocation}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-500">Last Update:</span>
                          <span className="font-medium">
                            {busLocation ? new Date(busLocation.timestamp).toLocaleTimeString() : "No data"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-500">Latitude:</span>
                          <span className="font-medium">
                            {busLocation?.latitude || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-500">Longitude:</span>
                          <span className="font-medium">
                            {busLocation?.longitude || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-500">Distance to School:</span>
                          <span className="font-medium">
                            {/* In a real implementation, we would calculate the distance */}
                            2.3 miles
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                      <h3 className="font-medium text-lg mb-2">No Bus Selected</h3>
                      <p className="text-neutral-500 text-sm mb-6">
                        Please select an active bus round from the dropdown above to view its real-time location.
                      </p>
                      <Select
                        value={selectedRoundId || ""}
                        onValueChange={handleRoundSelect}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an active round" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeRounds?.length ? (
                            activeRounds.map((round) => (
                              <SelectItem key={round.id} value={round.id.toString()}>
                                {round.name} ({round.type === "morning" ? "AM" : "PM"})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>
                              No active rounds available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Map Section */}
            <div className="lg:col-span-3">
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Live Map</CardTitle>
                    {selectedRound && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                        onClick={handleRefreshLocation}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Refresh
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div 
                    id={mapContainerId}
                    className="bg-neutral-100 h-[600px] rounded-lg flex items-center justify-center relative overflow-hidden"
                  >
                    {/* Placeholder for map - in a real implementation we would use Google Maps or another mapping API */}
                    <div className="absolute inset-0 w-full h-full bg-neutral-200 opacity-80"></div>

                    {selectedRound ? (
                      <>
                        {/* Bus location markers */}
                        <div className="absolute top-1/3 left-1/3 h-4 w-4 bg-primary-500 rounded-full animate-ping"></div>
                        <div className="absolute top-1/3 left-1/3 h-6 w-6 bg-white rounded-full flex items-center justify-center z-10 shadow-md">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-primary-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                            />
                          </svg>
                        </div>

                        {/* School location marker */}
                        <div className="absolute top-1/2 left-1/2 h-8 w-8 bg-white rounded-full flex items-center justify-center z-10 shadow-md border-2 border-primary-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-primary-700"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        </div>

                        {/* Student stops - would come from API in real implementation */}
                        <div className="absolute top-1/4 right-1/3 h-3 w-3 bg-secondary-500 rounded-full"></div>
                        <div className="absolute top-2/5 right-1/4 h-3 w-3 bg-secondary-500 rounded-full"></div>
                        <div className="absolute bottom-1/3 left-1/4 h-3 w-3 bg-secondary-500 rounded-full"></div>
                        <div className="absolute bottom-1/4 left-1/3 h-3 w-3 bg-secondary-500 rounded-full"></div>

                        {/* Route line - in a real implementation this would be a polyline */}
                        <div className="absolute top-1/3 left-1/3 w-1 h-20 bg-primary-300 rotate-45"></div>
                        <div className="absolute top-[calc(33%+14px)] left-[calc(33%+14px)] w-20 h-1 bg-primary-300"></div>
                        <div className="absolute top-[calc(33%+14px)] left-[calc(33%+14px+80px)] w-1 h-20 bg-primary-300 rotate-45"></div>
                        <div className="absolute top-[calc(33%+14px+14px+20px)] left-[calc(33%+14px+80px+14px)] w-60 h-1 bg-primary-300"></div>
                        <div className="absolute top-[calc(33%+14px+14px+20px)] left-[calc(33%+14px+80px+14px+240px)] w-1 h-60 bg-primary-300"></div>
                        <div className="absolute top-[calc(33%+14px+14px+20px+240px)] left-[calc(33%+14px+80px+14px+240px)] w-40 h-1 bg-primary-300"></div>
                        <div className="absolute top-[calc(33%+14px+14px+20px+240px)] left-[calc(33%+14px+80px+14px+240px-160px)] w-1 h-40 bg-primary-300"></div>
                        <div className="absolute top-[calc(33%+14px+14px+20px+240px+160px)] left-[calc(33%+14px+80px+14px+240px-160px)] w-30 h-1 bg-primary-300"></div>
                        <div className="absolute top-[calc(33%+14px+14px+20px+240px+160px)] left-[calc(33%+14px+80px+14px+240px-160px-120px)] w-1 h-30 bg-primary-300"></div>
                      </>
                    ) : (
                      <div className="text-center z-10">
                        <MapPin className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
                        <h3 className="text-lg font-medium text-neutral-600 mb-1">No Active Route Selected</h3>
                        <p className="text-sm text-neutral-500 max-w-md">
                          Select an active bus route from the dropdown to view its real-time location on the map
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedRound && (
                    <div className="mt-4 p-4 bg-neutral-50 rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">Students on this route</h3>
                        <Badge>
                          <Users className="h-3 w-3 mr-1" />
                          {/* In real implementation this would come from API */}
                          32 Students
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {/* In a real implementation, these would be actual students from API */}
                        {Array.from({ length: 6 }).map((_, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-white rounded shadow-sm">
                            <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-xs">
                              {index === 0 ? "JS" : index === 1 ? "LJ" : index === 2 ? "TW" : index === 3 ? "AM" : index === 4 ? "ED" : "RB"}
                            </div>
                            <div className="text-sm">
                              {index === 0 ? "Jason Smith" : index === 1 ? "Lisa Johnson" : index === 2 ? "Tyler Williams" : index === 3 ? "Alex Miller" : index === 4 ? "Emma Davis" : "Ryan Brown"}
                            </div>
                          </div>
                        ))}
                        {selectedRound && (
                          <div className="p-2 bg-white rounded shadow-sm flex items-center justify-center text-neutral-500 text-sm">
                            <span>+ 26 more</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
