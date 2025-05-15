import { useState, useEffect, useRef } from "react";
import { GoogleMap, LoadScript, OverlayView, Marker } from "@react-google-maps/api";
import axios from "axios";
import DotMarker from "./DotMarker";
import VendingMachineCard from "./VendingMachineCard";
import MultiMachineCard from "./MultiMachineCard";
import { VendingMachine } from "../@types/VendingMachine";

const containerStyle = {
  width: "100%",
  height: "100%",
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
  mutiMachine: boolean;
  setMutiMachine: (value: boolean) => void;
  onMapClick?: () => void;
}

const Map = ({ center, zoom, marker, mutiMachine, setMutiMachine, onMapClick }: MapProps) => {
  const [machines, setMachines] = useState<VendingMachine[]>([]);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMarkerId, setActiveMarkerId] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [machinesAtClickedLocation, setMachinesAtClickedLocation] = useState<VendingMachine[]>([]);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Fetch vending machine data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/vending-machine");
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
        setError("Failed to load map.");
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

  const findMachinesAtLocation = (clickedLat: number, clickedLon: number) => {
    const PROXIMITY_THRESHOLD = 0.00001;
    return machines.filter((machine) => {
      const latDiff = Math.abs(machine.lat - clickedLat);
      const lonDiff = Math.abs(machine.lon - clickedLon);
      return latDiff < PROXIMITY_THRESHOLD && lonDiff < PROXIMITY_THRESHOLD;
    });
  };

  const handleMarkerClick = (machine: VendingMachine) => {
    const machinesAtLocation = findMachinesAtLocation(machine.lat, machine.lon);
    setMachinesAtClickedLocation(machinesAtLocation);
    mapRef.current?.panTo({ lat: Number(machine.lat), lng: Number(machine.lon) });

    if (machinesAtLocation.length > 1) {
      setMutiMachine(true);
    } else if (machinesAtLocation.length === 1) {
      setMutiMachine(false);
      if (activeMarkerId === machine.id) {
        setActiveMarkerId(null);
      } else {
        setActiveMarkerId(machine.id);
      }
    }
  };

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onClick={onMapClick}
        onLoad={(map: google.maps.Map) => {
          mapRef.current = map;
        }}
      >
        {marker && <Marker position={marker} />}

        {machines.map((machine) => (
          <DotMarker
            key={machine.id}
            position={{ lat: Number(machine.lat), lng: Number(machine.lon) }}
            color={machine.available ? "GREEN" : "RED"}
            onClick={() => handleMarkerClick(machine)}
          />
        ))}

        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeColor: "white",
              strokeWeight: 2,
            }}
          />
        )}

        {!mutiMachine &&
          machines.map((machine) => {
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
                    items={(() => {
                      try {
                        return JSON.parse(machine.items);
                      } catch {
                        return [];
                      }
                    })()}
                    onClose={() => setActiveMarkerId(null)}
                  />
                </div>
              </OverlayView>
            );
          })}

        {mutiMachine && machinesAtClickedLocation.length > 0 && (
          <OverlayView
            position={{
              lat: machinesAtClickedLocation[0].lat,
              lng: machinesAtClickedLocation[0].lon,
            }}
            mapPaneName={OverlayView.FLOAT_PANE}
          >
            <div style={{ transform: "translate(-50%, -100%)" }}>
              <MultiMachineCard
                machines={machinesAtClickedLocation}
                onClose={() => setMutiMachine(false)}
              />
            </div>
          </OverlayView>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;