import { useState, useEffect, useRef } from "react";
import { GoogleMap, OverlayView, Marker } from "@react-google-maps/api";
import axios from "axios";
import DotMarker from "./DotMarker";
import MultiMachineCard from "./MultiMachineCard";
import { VendingMachine } from "../@types/VendingMachine";
import { useLocation } from "./SharedContext";
import "../css/Map.css";

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
  machines: VendingMachine[];
  setMachines: React.Dispatch<React.SetStateAction<VendingMachine[]>>;
}

const Map = ({
  center,
  zoom,
  marker,
  mutiMachine,
  setMutiMachine,
  onMapClick,
  machines,
  setMachines
}: MapProps) => {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [machinesAtClickedLocation, setMachinesAtClickedLocation] = useState<
    VendingMachine[]
  >([]);
  const mapRef = useRef<google.maps.Map | null>(null);
  const { getCurrentLocation } = useLocation();

  // Fetch vending machine data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/vending-machine");
        setMachines(res.data);
      } catch (error) {
        console.error("Error fetching vending machine data:", error);
      }
    };
    fetchData();
  }, []);

  // Ask for user location
  useEffect(() => {
    const getLocation = async () => {
      try {
        const position = await getCurrentLocation();
        setUserLocation({
          lat: position.lat,
          lng: position.lng,
        });
        console.log("Location:", { position });
      } catch (e) {
        console.error("Failed to get user location", e);
      }
    };

    getLocation();
  }, []);

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
    mapRef.current?.panTo({
      lat: Number(machine.lat),
      lng: Number(machine.lon),
    });

    if (machinesAtLocation.length >= 1) {
      setMutiMachine(true);
    } else {
      setMutiMachine(false);
    }
  };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onClick={onMapClick}
      onLoad={(map: google.maps.Map) => {
        mapRef.current = map;
      }}
    >
      {console.log("In map:",machines)}

      {machines.map((machine) => (
        <DotMarker
          key={machine.id}
          position={{ lat: Number(machine.lat), lng: Number(machine.lon) }}
          color={machine.available ? "GREEN" : "RED"}
          onClick={() => handleMarkerClick(machine)}
        />
      ))}

      {userLocation && window.google && window.google.maps && (
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

      {mutiMachine && machinesAtClickedLocation.length > 0 && (
        <div
          className="slide-up-card"
          style={{
            transform: "translate(-50%, -100%)",
          }}
        >
          <MultiMachineCard
            machines={machinesAtClickedLocation}
            onClose={() => setMutiMachine(false)}
          />
        </div>
      )}
    </GoogleMap>
  );
};

export default Map;
