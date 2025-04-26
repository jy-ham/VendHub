import Map from './components/Map';
import { useState } from 'react';
import SearchBar from './components/SearchBar';
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete';


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
    <div>
      <div>
        <div>
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>
      <div>
        <Map
          center={BCIT_DEFAULT_LOCATION}
          zoom={16}
          marker={BCIT_DEFAULT_LOCATION}
        />
      </div>
    </div>
  );
}

export default App;