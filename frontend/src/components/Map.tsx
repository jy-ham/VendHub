import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, OverlayView } from '@react-google-maps/api';
import axios from 'axios';
import DotMarker from './DotMarker';
import VendingMachineCard from './VendingMachineCard';


const containerStyle = {
    width: '100%',
    height: '100%',
    overflow: 'hidden'
};
const GREEN = "#00FF00"
const RED = "#FF0000"
const BLUE = "#4285F4"
const YELLOW = "#FFC107"
//-------------TEST--------------------
const machines = [
    {
        id: 1,
        lat: 49.2488,
        lng: -122.9995,
        color: GREEN,
        title: 'Machine A',
        items: ['Cola', 'Chips', 'Candy']
    },
    {
        id: 2,
        lat: 49.249,
        lng: -122.998,
        color: YELLOW,
        title: 'Machine B',
        items: ['Water', 'Gum']
    },
    {
        id: 3,
        lat: 49.248,
        lng: -122.999,
        color: RED,
        title: 'Machine C',
        items: ['Energy Drink', 'Protein Bar']
    },
    {
        id: 4,
        lat: 49.24887,
        lng: -122.9999,
        color: BLUE,
        title: 'Machine D',
        items: ['Soda', 'Chips', 'Pretzels']
    },
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
            >
                {machines.map((machine) => (
                    <DotMarker
                        key={machine.id}
                        position={{ lat: machine.lat, lng: machine.lng }}
                        color={machine.color}
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
                            position={{ lat: machine.lat, lng: machine.lng }}
                            mapPaneName={OverlayView.FLOAT_PANE}
                        >
                            <div style={{ transform: 'translate(-50%, -100%)' }}>
                                <VendingMachineCard
                                    title={machine.title}
                                    items={machine.items}
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
