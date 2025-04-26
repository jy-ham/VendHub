import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import axios from 'axios';

const containerStyle = {
    width: '100vw',
    height: '100vh',
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
            </GoogleMap>
        </LoadScript>
    );
};

export default Map;
