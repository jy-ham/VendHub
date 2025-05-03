import { useState, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  OverlayView,
  Marker,
} from "@react-google-maps/api";
import axios from "axios";
import DotMarker from "./DotMarker";
import VendingMachineCard from "./VendingMachineCard";

const containerStyle = {
  width: "100%",
  height: "100%",
  overflow: "hidden",
};

interface MapProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  marker?: {
    lat: number;
    lng: number;
  };
}

interface VendingMachine {
  id: number;
  location: string;
  desc: string;
  available: boolean;
  lat: number;
  lon: number;
  items: string;
  createdAt: string;
}

const Map = ({ center, zoom, marker }: MapProps) => {
  const [machines, setMachines] = useState<VendingMachine[]>([]);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMarkerId, setActiveMarkerId] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Fetch vending machine data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3001/api/vending-machine"
        );
        console.log("Fetched machines:", res.data);
        setMachines(res.data);
      } catch (error) {
        console.error("Error fetching vending machine data:", error);
      }
    };

    fetchData();
  }, []);

  // Fetch Google Maps API key
  useEffect(() => {
    const fetchKey = async () => {
      try {
        const response = await axios.get("/api/map-key");
        setApiKey(response.data.key);
      } catch (err) {
        setError("Failed to load map");
      } finally {
        setLoading(false);
      }
    };

    fetchKey();
  }, []);

  // Ask for user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Failed to get user location", error);
        }
      );
    }
  }, []);

  if (loading) return <div>Loading map...</div>;
  if (error) return <div>{error}</div>;
  if (!apiKey) return <div>Map unavailable</div>;

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={zoom}>
        {/* Vending Machine Markers */}
        {machines.map((machine) => (
          <DotMarker
            key={machine.id}
            position={{ lat: Number(machine.lat), lng: Number(machine.lon) }}
            color={machine.available ? "GREEN" : "RED"}
            onClick={() => {
              if (activeMarkerId === machine.id) {
                setActiveMarkerId(null);
              } else {
                setActiveMarkerId(machine.id);
              }
            }}
          />
        ))}

        {/* User Location Marker (blue dot) */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#4285F4", // Google blue
              fillOpacity: 1,
              strokeColor: "white",
              strokeWeight: 2,
            }}
          />
        )}

        {/* Show InfoWindow only for the active machine */}
        {machines.map((machine) => {
          if (machine.id !== activeMarkerId) return null;
          return (
            <OverlayView
              key={machine.id}
              position={{ lat: Number(machine.lat), lng: Number(machine.lon) }}
              mapPaneName={OverlayView.FLOAT_PANE}
            >
              <div style={{ transform: "translate(-50%, -100%)" }}>
                <VendingMachineCard
                  title={machine.location}
                  items={JSON.parse(machine.items)}
                  onClose={() => setActiveMarkerId(null)}
                />
              </div>
            </OverlayView>
          );
        })}
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;
