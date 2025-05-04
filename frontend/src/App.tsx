
import { useState } from 'react';
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import Map from './components/Map';
import SearchBar from './components/SearchBar';
import "./App.css";
import Add from './components/Add';

function App() {
  const BCIT_DEFAULT_LOCATION = {
    lat: 49.2488,
    lng: -122.9995
  };
  const [center, setCenter] = useState(BCIT_DEFAULT_LOCATION);
  const [markerPosition, setMarkerPosition] = useState(BCIT_DEFAULT_LOCATION);
  const [dismissSuggestions, setDismissSuggestions] = useState(false);

  const handleSearch = (location: { lat: number; lng: number }) => {
    setCenter(location);
    setMarkerPosition(location)
  };

  const handleMapClick = () => {
    setDismissSuggestions(true);
  };
  return (
    <div className="app-container">
      <div className="search-bar-wrapper">
        <SearchBar 
          onSearch={handleSearch} 
          dismissSuggestions={dismissSuggestions}
          setDismissSuggestions={setDismissSuggestions}
          />
      </div>
      <div className="map-container">
        <Map center={center} zoom={18} marker={markerPosition} onMapClick={handleMapClick}/>
      </div>
      <div style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 1000 }}>
        <Add/>
      </div>
    </div>
  );
}

export default App;