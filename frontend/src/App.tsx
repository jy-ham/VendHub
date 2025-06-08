import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LocationProvider } from "./components/SharedContext";
import Map from "./components/Map";
import SearchBar from "./components/SearchBar";
import UserAuthForm from "./components/UserAuthForm";
import { LoadScript } from "@react-google-maps/api";
import axios from "axios";
import MachineDetailPage from "./components/MachineDetailsPage";
import { VendingMachine } from "./@types/VendingMachine";
import "./App.css";

function App() {
  const BCIT_DEFAULT_LOCATION = { lat: 49.2488, lng: -122.9995 };
  const [center, setCenter] = useState(BCIT_DEFAULT_LOCATION);
  const [markerPosition, setMarkerPosition] = useState(BCIT_DEFAULT_LOCATION);
  const [dismissSuggestions, setDismissSuggestions] = useState(false);
  const [mutiMachine, setMutiMachine] = useState<boolean>(false);
  const [showAuth, setShowAuth] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [machines, setMachines] = useState<VendingMachine[]>([]);

  const handleSearch = (location: { lat: number; lng: number }) => {
    setCenter(location);
    setMarkerPosition(location);
  };

  const handleMapClick = () => {
    setDismissSuggestions(true);
    setMutiMachine(false);
  };

  // Fetch Google Maps API key NOTE: will move this from backend to frontend once it's hosted
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
  // api checking
  if (loading) return <div>Loading map...</div>;
  if (error) return <div>{error}</div>;
  if (!apiKey) return <div>Map unavailable</div>;

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <Router>
        <Routes>
          {/* MAIN MAP ROUTE */}
          <Route
            path="/"
            element={
              <LocationProvider>
                <div className="app-container relative">
                  {/* Search Bar */}
                  <div className="search-bar-wrapper">
                    <SearchBar
                      onSearch={handleSearch}
                      dismissSuggestions={dismissSuggestions}
                      setDismissSuggestions={setDismissSuggestions}
                      setShowAuth={setShowAuth}
                      isLoggedIn={isLoggedIn}
                      setMachines={setMachines}
                    />
                  </div>
                  {/* Map Display */}
                  <div className="map-container">
                    <Map
                      center={center}
                      zoom={18}
                      marker={markerPosition}
                      mutiMachine={mutiMachine}
                      setMutiMachine={setMutiMachine}
                      onMapClick={handleMapClick}
                      setMachines={setMachines}
                      machines={machines}
                    />
                  </div>
                  {/* Auth Modal (pop-up) */}
                  {showAuth && (
                    <div className="auth-modal">
                      <div className="auth-modal-content">
                        <UserAuthForm
                          onClose={() => setShowAuth(false)}
                          setIsLoggedIn={setIsLoggedIn}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </LocationProvider>
            }
          />

          {/* MACHINE DETAILS ROUTE */}
          <Route path="/machines/:machineId" element={<MachineDetailPage />} />
        </Routes>
      </Router>
    </LoadScript>
  );
}
export default App;
