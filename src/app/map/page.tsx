"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ObjectId } from "mongodb";

// Dynamically import the Map component to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("../components/MapComponent"), {
  ssr: false,
});

interface Marker {
  _id?: ObjectId;
  name: string;
  lat: number;
  lng: number;
  type?: string;
}

interface ApiError {
  error: string;
  details?: {
    message: string;
    timestamp: string;
    additionalInfo?: Record<string, unknown>;
  };
}

export default function MapPage() {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch existing markers when component mounts
    fetchMarkers();
  }, []);

  const fetchMarkers = async () => {
    try {
      console.log('Fetching markers from API...');
      setLoading(true);
      const response = await fetch("/api/markers");
      
      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.details?.message || errorData.error || 'Failed to fetch markers');
      }

      const data = await response.json();
      console.log(`Successfully fetched ${data.length} markers from API`);
      setMarkers(data);
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error fetching markers:', {
        message: errorMessage,
        timestamp: new Date().toISOString(),
      });
      setError(`Failed to load markers: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = async (lat: number, lng: number, name: string, type: string) => {
    try {
      console.log('Adding new marker at coordinates:', { lat, lng, name });
      const response = await fetch("/api/markers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lat, lng, name, type }),
      });
      
      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.details?.message || errorData.error || 'Failed to add marker');
      }

      const newMarker = await response.json();
      console.log('Successfully added new marker:', newMarker);
      setMarkers([...markers, newMarker]);
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error adding marker:', {
        coordinates: { lat, lng, name },
        message: errorMessage,
        timestamp: new Date().toISOString(),
      });
      setError(`Failed to add marker: ${errorMessage}`);
    }
  };

  const handleMarkerDragEnd = async (markerId: string, lat: number, lng: number) => {
    try {
      console.log('Updating marker position:', { markerId, lat, lng });
      const response = await fetch(`/api/markers/${markerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lat, lng }),
      });
      
      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.details?.message || errorData.error || 'Failed to update marker position');
      }

      console.log('Successfully updated marker position');
      setMarkers(markers.map(marker => 
        marker._id?.toString() === markerId ? { ...marker, lat, lng } : marker
      ));
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error updating marker position:', {
        markerId,
        coordinates: { lat, lng },
        message: errorMessage,
        timestamp: new Date().toISOString(),
      });
      setError(`Failed to update marker position: ${errorMessage}`);
      // Refresh markers to ensure UI is in sync with server
      fetchMarkers();
    }
  };

  const handleMarkerDelete = async (markerId: string) => {
    try {
      console.log('Deleting marker:', markerId);
      const response = await fetch(`/api/markers/${markerId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.details?.message || errorData.error || 'Failed to delete marker');
      }

      console.log('Successfully deleted marker');
      setMarkers(markers.filter(marker => marker._id?.toString() !== markerId));
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error deleting marker:', {
        markerId,
        message: errorMessage,
        timestamp: new Date().toISOString(),
      });
      setError(`Failed to delete marker: ${errorMessage}`);
      // Refresh markers to ensure UI is in sync with server
      fetchMarkers();
    }
  };

  return (
    <div className="h-screen w-full relative">
      {error && (
        <div className="absolute top-4 left-4 right-4 z-[1000] bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">{error}</p>
        </div>
      )}
      {loading ? (
        <div className="h-full w-full flex items-center justify-center bg-gray-100">
          <div className="text-gray-600">Loading markers...</div>
        </div>
      ) : (
        <MapComponent 
          markers={markers} 
          onMapClick={handleMapClick} 
          onMarkerDragEnd={handleMarkerDragEnd}
          onMarkerDelete={handleMarkerDelete}
        />
      )}
    </div>
  );
}
