import { useEffect, useRef } from "react";
import { useMap } from "@/hooks/use-map";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { BusRound, Bus, Location } from "@shared/schema";

export function MapView() {
  const mapContainerId = "bus-tracking-map";
  const mapRef = useRef<HTMLDivElement>(null);
  const { busMarkers, addBusMarker, isLoaded } = useMap(mapContainerId);

  // Fetch active rounds
  const { data: activeRounds } = useQuery<BusRound[]>({
    queryKey: ["/api/bus-rounds?status=in_progress"],
  });

  // Fetch buses
  const { data: buses } = useQuery<Bus[]>({
    queryKey: ["/api/buses"],
  });

  // Fetch bus locations for active rounds
  useEffect(() => {
    if (isLoaded && activeRounds && buses) {
      // In a real implementation, we would poll for bus locations
      // and update the markers on the map

      // For demo purposes, add some mock bus markers
      const mockBusMarkers = [
        {
          id: 1,
          position: { lat: 37.7749, lng: -122.4194 },
          label: "Bus #101",
          busNumber: "101",
        },
        {
          id: 2,
          position: { lat: 37.7849, lng: -122.4294 },
          label: "Bus #203",
          busNumber: "203",
        },
        {
          id: 3,
          position: { lat: 37.7649, lng: -122.4094 },
          label: "Bus #315",
          busNumber: "315",
        },
      ];

      mockBusMarkers.forEach((bus) => {
        addBusMarker(bus);
      });
    }
  }, [isLoaded, activeRounds, buses]);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-neutral-200">
        <h2 className="font-medium text-lg text-neutral-900">
          Live Bus Tracking
        </h2>
      </div>
      <div className="p-4">
        <div
          id={mapContainerId}
          ref={mapRef}
          className="bg-neutral-100 h-80 rounded-lg flex items-center justify-center relative overflow-hidden"
        >
          {/* Placeholder for map - in a real implementation we would use Google Maps or another mapping API */}
          <div className="absolute inset-0 w-full h-full bg-neutral-200 opacity-80"></div>

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

          <div className="absolute top-2/3 right-1/4 h-4 w-4 bg-secondary-500 rounded-full animate-ping"></div>
          <div className="absolute top-2/3 right-1/4 h-6 w-6 bg-white rounded-full flex items-center justify-center z-10 shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-secondary-500"
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

          <div className="absolute top-1/4 right-1/3 h-4 w-4 bg-success-500 rounded-full animate-ping"></div>
          <div className="absolute top-1/4 right-1/3 h-6 w-6 bg-white rounded-full flex items-center justify-center z-10 shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-success-500"
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
        </div>

        <div className="flex justify-between mt-4">
          <div className="flex space-x-2">
            <span className="inline-flex items-center text-xs text-neutral-700 bg-neutral-100 rounded-full px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-primary-500 mr-1"></span>
              Bus #101
            </span>
            <span className="inline-flex items-center text-xs text-neutral-700 bg-neutral-100 rounded-full px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-secondary-500 mr-1"></span>
              Bus #203
            </span>
            <span className="inline-flex items-center text-xs text-neutral-700 bg-neutral-100 rounded-full px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-success-500 mr-1"></span>
              Bus #315
            </span>
          </div>
          <Button
            variant="link"
            className="text-primary-600 text-sm font-medium hover:text-primary-700"
          >
            View All Buses
          </Button>
        </div>
      </div>
    </div>
  );
}
