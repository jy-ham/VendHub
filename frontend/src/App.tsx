import { useState } from "react";
import { geocodeByAddress, getLatLng } from "react-places-autocomplete";
import Map from "./components/Map";
import SearchBar from "./components/SearchBar";
import Add from "./components/Add";
import UserAuthForm from "./components/UserAuthForm";
import "./App.css";

function App() {
  const BCIT_DEFAULT_LOCATION = { lat: 49.2488, lng: -122.9995 };
  const [center, setCenter] = useState(BCIT_DEFAULT_LOCATION);
  const [showAuth, setShowAuth] = useState(false);

  const handleSearch = async (query: string) => {
    try {
      const results = await geocodeByAddress(query);
      const latLng = await getLatLng(results[0]);
      setCenter(latLng);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  return (
    <div className="app-container relative">
      {/* Top-right Login Button */}
      <button className="login-button" onClick={() => setShowAuth(true)}>
        Login / Signup
      </button>

      {/* Search Bar */}
      <div className="search-bar-wrapper">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Map Display */}
      <div className="map-container">
        <Map center={center} zoom={18} />
      </div>

      {/* Add Button */}
      <div
        style={{ position: "fixed", top: "20px", left: "20px", zIndex: 1000 }}
      >
        <Add />
      </div>

      {showAuth && (
        <div className="auth-modal">
          <div className="auth-modal-content">
            <UserAuthForm onClose={() => setShowAuth(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
