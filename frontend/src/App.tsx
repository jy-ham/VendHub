
import { useState } from 'react';
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import Map from './components/Map';
import SearchBar from './components/SearchBar';

function App() {
  const BCIT_DEFAULT_LOCATION = {
    lat: 49.2488,
    lng: -122.9995
  };
  const [center, setCenter] = useState(BCIT_DEFAULT_LOCATION);

  const handleSearch = async (query: string) => {
    try {
      const results = await geocodeByAddress(query);
      const latLng = await getLatLng(results[0]);
      setCenter(latLng);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };
  return (
    <div className="app-container">
      <div className="search-bar-wrapper">
        <SearchBar onSearch={handleSearch} />
      </div>
      <div className="map-container">
        <Map center={center} zoom={18} />
      </div>
    </div>
  );
}

export default App;