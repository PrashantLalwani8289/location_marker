"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { ObjectId } from "mongodb";
import Modal from "./Modal";

// Define available marker types
const MARKER_TYPES = {
  KISS: { emoji: '💋', name: 'Kiss' },
  HUG: { emoji: '🤗', name: 'Hug' },
  FOOD: { emoji: '🍽️', name: 'Food' },
  DATE: { emoji: '💑', name: 'Date' },
  LOVE: { emoji: '❤️', name: 'Love' },
  GIFT: { emoji: '🎁', name: 'Gift' },
  ROMANCE: { emoji: '🌹', name: 'Romance' },
  FUN: { emoji: '🎭', name: 'Fun' },
  DEFAULT: { emoji: '📍', name: 'Default' }
};

interface MarkerData {
  _id?: ObjectId;
  name: string;
  lat: number;
  lng: number;
  type?: string; // Store the emoji for the marker type
}

interface MapComponentProps {
  markers: Array<MarkerData>;
  onMapClick: (lat: number, lng: number, name: string, type: string) => void;
  onMarkerDragEnd?: (markerId: string, lat: number, lng: number) => void;
  onMarkerDelete?: (markerId: string) => void;
}

// Create marker icons for different types
const createMarkerIcon = (emoji: string) => {
  return new L.DivIcon({
    html: `<div class="marker-icon">${emoji}</div>`,
    className: '',
    iconSize: [50, 50],
    iconAnchor: [25, 25],
  });
};

// Add marker icon styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .marker-icon {
      font-size: 40px;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: markerPop 0.3s ease-out;
    }
    @keyframes markerPop {
      0% { transform: scale(0.5); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

// Create icons for all marker types
const markerIcons = Object.values(MARKER_TYPES).reduce((acc, { emoji }) => {
  acc[emoji] = createMarkerIcon(emoji);
  return acc;
}, {} as { [key: string]: L.DivIcon });

// Create a custom heart icon for user location
const heartIcon = new L.DivIcon({
  html: '<div class="heart-marker">❤️</div>',
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Add heart marker animation styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .heart-marker {
      font-size: 40px;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: heartPulse 1.5s ease-in-out infinite;
    }
    @keyframes heartPulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
  `;
  document.head.appendChild(style);
}

// function LocationButton() {

//   const handleClick = () => {
//     window.location.reload();
//   };

//   return (
//     <button
//       onClick={handleClick}
//       className="absolute z-[1000] top-4 right-4 bg-white p-2 rounded-lg shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
//       title="Go to my location"
//     >
//         <span>📍</span>
//       <span>Reset</span>
//       <span>View</span>
//     </button>
//   );
// }

function LocationMarker() {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMap();

  useEffect(() => {
    const handleLocationFound = (e: L.LocationEvent) => {
      setPosition(e.latlng);
      // Only fly to location on initial load
      if (!position) {
        map.flyTo(e.latlng, map.getZoom());
      }
    };

    map.locate().on("locationfound", handleLocationFound);

    // Update location periodically
    const intervalId = setInterval(() => {
      map.locate();
    }, 10000); // Update every 10 seconds

    return () => {
      clearInterval(intervalId);
      map.off("locationfound", handleLocationFound);
    };
  }, [map, position]);

  return position === null ? null : (
    <Marker position={position} icon={heartIcon} zIndexOffset={1000}>
      <Popup closeButton={false} autoClose={false} closeOnClick={false}>
        <strong>❤️ You are here my Love</strong>
      </Popup>
    </Marker>
  );
}

function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number, name: string, type: string) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempCoords, setTempCoords] = useState<{ lat: number; lng: number } | null>(null);

  const handleClick = (e: L.LeafletMouseEvent) => {
    setTempCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    setIsModalOpen(true);
  };

  const handleModalSubmit = (name: string) => {
    if (tempCoords) {
      // Extract emoji and name from the combined string
      const matches = name.match(/^(\S+)\s+(.+)$/);
      if (matches) {
        const [, emoji, nameValue] = matches;
        onMapClick(tempCoords.lat, tempCoords.lng, nameValue, emoji);
      } else {
        onMapClick(tempCoords.lat, tempCoords.lng, name, MARKER_TYPES.DEFAULT.emoji);
      }
      setIsModalOpen(false);
      setTempCoords(null);
    }
  };

  useMapEvents({
    click: handleClick,
  });

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={() => {
        setIsModalOpen(false);
        setTempCoords(null);
      }}
      onSubmit={handleModalSubmit}
      title="Add New Marker"
    />
  );
}

export default function MapComponent({ markers, onMapClick, onMarkerDragEnd, onMarkerDelete }: MapComponentProps) {
  const [center, setCenter] = useState({ lat: 40.7128, lng: -74.0060 }); // Default center
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoading(false);
        },
        () => {
          // If geolocation fails, use default center
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // @ts-expect-error - Leaflet internal typing issue
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  if (loading) {
    return <div className="h-full w-full flex items-center justify-center">Loading map...</div>;
  }

  return (
    <MapContainer
      center={center}
      zoom={18}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker />
      {/* <LocationButton /> */}
      <MapEvents onMapClick={onMapClick} />
      {markers.map((marker) => {
        const markerType = marker.type || MARKER_TYPES.DEFAULT.emoji;
        const icon = markerIcons[markerType];
        
        return (
          <Marker
            key={marker._id?.toString() || `${marker.lat}-${marker.lng}`}
            position={[marker.lat, marker.lng]}
            icon={icon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const latlng = e.target.getLatLng();
                if (marker._id && onMarkerDragEnd) {
                  onMarkerDragEnd(marker._id.toString(), latlng.lat, latlng.lng);
                }
              },
            }}
          >
            <Popup>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{markerType}</span>
                  <strong>{marker.name}</strong>
                </div>
                {marker._id?.toString() && onMarkerDelete && (
                  <button
                    onClick={() => onMarkerDelete(marker._id!.toString())}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm flex items-center gap-1"
                  >
                    <span>🗑️</span>
                    <span>Delete Marker</span>
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
