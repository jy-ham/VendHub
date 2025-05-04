import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, OverlayView, Marker} from '@react-google-maps/api';
import axios from 'axios';
import DotMarker from './DotMarker';
import VendingMachineCard from './VendingMachineCard';


const containerStyle = {
    width: '100%',
    height: '100%',
    overflow: 'hidden'
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
    onMapClick?: () => void;
}

interface VendingMachine {
    id: number;
    location: string;
    desc: string;
    available: boolean;
    lat: number;
    lon: number;
    items: string;
    createdAt: string;
}

const Map = ({ center, zoom, marker, onMapClick}: MapProps) => {

    const [machines, setMachines] = useState<VendingMachine[]>([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('http://localhost:3001/api/vending-machine');
                console.log('Fetched machines:', res.data);
                setMachines(res.data);
            } catch (error) {
                console.error('Error fetching vending machine data:', error);
            }
        };

        fetchData();
    }, []);

    const [apiKey, setApiKey] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeMarkerId, setActiveMarkerId] = useState<number | null>(null);


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
                onClick={onMapClick}
            >
            <Marker position={marker} />
                {machines.map((machine) => (
                    <DotMarker
                        key={machine.id}
                        position={{ lat: Number(machine.lat), lng: Number(machine.lon) }}
                        color={machine.available ? 'GREEN' : 'RED'}
                        onClick={() => {
                            if (activeMarkerId === machine.id) {
                                setActiveMarkerId(null);
                            } else {
                                setActiveMarkerId(machine.id);
                            }
                        }}
                    />
                ))}

                {/* Show InfoWindow only for the active machine */}
                {machines.map((machine) => {
                    if (machine.id !== activeMarkerId) return null;
                    return (
                        <OverlayView
                            key={machine.id}
                            position={{ lat: Number(machine.lat), lng: Number(machine.lon) }}
                            mapPaneName={OverlayView.FLOAT_PANE}
                        >
                            <div style={{ transform: 'translate(-50%, -100%)' }}>
                                <VendingMachineCard
                                    title={machine.location}
                                    items={JSON.parse(machine.items)}
                                    onClose={() => setActiveMarkerId(null)}
                                />
                            </div>
                        </OverlayView>
                    );
                })}
            </GoogleMap>
        </LoadScript>
    );
};

export default Map;
