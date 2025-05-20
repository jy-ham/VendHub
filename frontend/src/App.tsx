import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { LocationProvider } from "./components/SharedContext";
import Map from "./components/Map";
import SearchBar from "./components/SearchBar";
import Add from "./components/AddButton";
import UserAuthForm from "./components/UserAuthForm";
import MachineDetailPage from "./components/MachineDetailsPage";
import "./App.css";

function App() {
  const BCIT_DEFAULT_LOCATION = { lat: 49.2488, lng: -122.9995 };
  const [center, setCenter] = useState(BCIT_DEFAULT_LOCATION);
  const [markerPosition, setMarkerPosition] = useState(BCIT_DEFAULT_LOCATION);
  const [dismissSuggestions, setDismissSuggestions] = useState(false);
  const [mutiMachine, setMutiMachine] = useState<boolean>(false);
  const [showAuth, setShowAuth] = useState(false);

  const handleSearch = (location: { lat: number; lng: number }) => {
    setCenter(location);
    setMarkerPosition(location);
  };

  const handleMapClick = () => {
    setDismissSuggestions(true);
    setMutiMachine(false);
  };

  return (
      <Router>
        <Routes>
          {/* MAIN MAP ROUTE */}
          <Route
              path="/"
              element={
                <LocationProvider>
                  <div className="app-container relative">
                    {/* Top-right Login Button */}
                    <button className="login-button" onClick={() => setShowAuth(true)}>
                      Login / Signup
                    </button>

                    {/* Search Bar */}
                    <div className="search-bar-wrapper">
                      <SearchBar
                          onSearch={handleSearch}
                          dismissSuggestions={dismissSuggestions}
                          setDismissSuggestions={setDismissSuggestions}
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
                      />
                    </div>

                    {/* Add Button (top-left corner) */}
                    <div style={{ position: "fixed", top: "20px", left: "20px", zIndex: 1000 }}>
                      <Add />
                    </div>

                    {/* Auth Modal (pop-up) */}
                    {showAuth && (
                        <div className="auth-modal">
                          <div className="auth-modal-content">
                            <UserAuthForm onClose={() => setShowAuth(false)} />
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
  );
}

export default App;
