"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { ObjectId } from "mongodb";
import Modal from "./Modal";

interface MapComponentProps {
  markers: Array<{
    _id?: ObjectId;
    name: string;
    lat: number;
    lng: number;
  }>;
  onMapClick: (lat: number, lng: number, name: string) => void;
  onMarkerDragEnd?: (markerId: string, lat: number, lng: number) => void;
  onMarkerDelete?: (markerId: string) => void;
}

const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function LocationMarker() {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    });

    // Update location periodically
    const intervalId = setInterval(() => {
      map.locate();
    }, 10000); // Update every 10 seconds

    return () => clearInterval(intervalId);
  }, [map]);

  return position === null ? null : (
    <Marker position={position} icon={userIcon} zIndexOffset={1000}>
      <Popup closeButton={false} autoClose={false} closeOnClick={false}>
        <strong>📍 You are here</strong>
      </Popup>
    </Marker>
  );
}

function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number, name: string) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempCoords, setTempCoords] = useState<{ lat: number; lng: number } | null>(null);

  const handleClick = (e: L.LeafletMouseEvent) => {
    setTempCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    setIsModalOpen(true);
  };

  const handleModalSubmit = (name: string) => {
    if (tempCoords) {
      onMapClick(tempCoords.lat, tempCoords.lng, name);
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
      <MapEvents onMapClick={onMapClick} />
      {markers.map((marker) => (
        <Marker
          key={marker._id?.toString() || `${marker.lat}-${marker.lng}`}
          position={[marker.lat, marker.lng]}
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
              <strong>{marker.name}</strong>
              {marker._id?.toString() && onMarkerDelete && (
                <button
                  onClick={() => onMarkerDelete(marker._id!.toString())}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                >
                  Delete Marker
                </button>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
