
import { useState } from 'react';
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import Map from './components/Map';
import SearchBar from './components/SearchBar';
import "./App.css";



function App() {
  const BCIT_DEFAULT_LOCATION = {
    lat: 49.2488,
    lng: -122.9995
  };
  const [center, setCenter] = useState(BCIT_DEFAULT_LOCATION);
  const [markerPosition, setMarkerPosition] = useState(BCIT_DEFAULT_LOCATION);
  const [dismissSuggestions, setDismissSuggestions] = useState(false);
  const [mutiMachine, setMutiMachine] = useState<boolean>(false);

  const handleSearch = (location: { lat: number; lng: number }) => {
    setCenter(location);
    setMarkerPosition(location)
  };

  const handleMapClick = () => {
    setDismissSuggestions(true);
    setMutiMachine(false)
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
        <Map 
          center={center} 
          zoom={18} 
          marker={markerPosition} 
          mutiMachine = {mutiMachine} 
          setMutiMachine = {setMutiMachine}
          onMapClick={handleMapClick}/>
      </div>
     
    </div>
  );
}

export default App;