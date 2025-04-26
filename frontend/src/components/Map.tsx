import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import axios from 'axios';
import DotMarker from './DotMarker';
const containerStyle = {
    width: '100vw',
    height: '100vh',
};
const GREEN = "#00FF00"
const RED = "#FF0000"
const BLUE = "#4285F4"
const YELLOW = "#FFC107"
//-------------TEST--------------------
const machines = [
    { id: 1, lat: 49.2488, lng: -122.9995, color: GREEN },
    { id: 2, lat: 49.249, lng: -122.998, color: YELLOW },
    { id: 3, lat: 49.248, lng: -122.999, color: RED },
    { id: 4, lat: 49.24887, lng: -122.9999, color: BLUE },
];
//---------TEST--------------------
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

const Map = ({ center, zoom, marker }: MapProps) => {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchKey = async () => {
            try {
                const response = await axios.get('/api/map-key');
                setApiKey(response.data.key);
            } catch (err) {
                setError('Failed to load map');
            } finally {
                setLoading(false);
            }
        };

        fetchKey();
    }, []);

    if (loading) return <div>Loading map...</div>;
    if (error) return <div>{error}</div>;
    if (!apiKey) return <div>Map unavailable</div>;

    return (
        <LoadScript googleMapsApiKey={apiKey}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={zoom}
            >
                {marker && <Marker position={marker} />}
                {machines.map((location) => (
                    <DotMarker
                        key={location.id}
                        position={{ lat: location.lat, lng: location.lng }}
                        color={location.color}
                    />
                ))}
            </GoogleMap>
        </LoadScript>
    );
};

export default Map;
