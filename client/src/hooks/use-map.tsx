import { useEffect, useState } from "react";

type LatLng = {
  lat: number;
  lng: number;
};

type MapHookOptions = {
  initialCenter?: LatLng;
  zoom?: number;
  markers?: BusMarker[];
};

type BusMarker = {
  id: number;
  position: LatLng;
  label: string;
  icon?: string;
  busNumber: string;
};

export function useMap(elementId: string, options: MapHookOptions = {}) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<Map<number, google.maps.Marker>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);
  const [busMarkers, setBusMarkers] = useState<BusMarker[]>(options.markers || []);
  
  const defaultCenter = options.initialCenter || { lat: 37.7749, lng: -122.4194 }; // Default to San Francisco
  const defaultZoom = options.zoom || 13;

  // Initialize Google Maps once the component mounts
  useEffect(() => {
    // Simulating Google Maps API by creating mock functions
    // In a real implementation, we would load the actual Google Maps API
    // and initialize a real map
    if (!isLoaded) {
      const mapElement = document.getElementById(elementId);
      if (mapElement) {
        // Mock implementation - would be a real Google Map in production
        // This would normally be handled by the Google Maps JavaScript API
        setIsLoaded(true);
        setMap({} as google.maps.Map);
      }
    }
  }, [elementId, isLoaded]);

  // Update markers when busMarkers change
  useEffect(() => {
    if (map && busMarkers.length > 0) {
      // Clear old markers that aren't in the new set
      markers.forEach((marker, id) => {
        if (!busMarkers.some(bus => bus.id === id)) {
          // marker.setMap(null); // Would remove the marker from the map
          markers.delete(id);
        }
      });

      // Add/update markers
      busMarkers.forEach(bus => {
        if (markers.has(bus.id)) {
          // Update existing marker position
          // markers.get(bus.id)?.setPosition(bus.position);
        } else {
          // Create new marker
          const mockMarker = {} as google.maps.Marker;
          markers.set(bus.id, mockMarker);
        }
      });

      setMarkers(new Map(markers));
    }
  }, [map, busMarkers]);

  // Add a new bus marker
  const addBusMarker = (bus: BusMarker) => {
    setBusMarkers(prev => [...prev, bus]);
  };

  // Update a bus marker's position
  const updateBusPosition = (busId: number, position: LatLng) => {
    setBusMarkers(prev => 
      prev.map(bus => 
        bus.id === busId ? { ...bus, position } : bus
      )
    );
  };

  // Remove a bus marker
  const removeBusMarker = (busId: number) => {
    setBusMarkers(prev => prev.filter(bus => bus.id !== busId));
  };

  // Center the map on a specific position
  const centerMap = (position: LatLng) => {
    if (map) {
      // In a real implementation this would center the map
      // map.setCenter(position);
    }
  };

  return {
    map,
    isLoaded,
    busMarkers,
    addBusMarker,
    updateBusPosition,
    removeBusMarker,
    centerMap
  };
}
