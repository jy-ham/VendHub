import { Marker } from '@react-google-maps/api';

interface DotMarkerProps {
    position: {
        lat: number;
        lng: number;
    };
    color?: string;
    size?: number;
    borderColor?: string;
    borderWidth?: number;
}

const DotMarker = ({
    position,
    color = '#00FF00',
    size = 20,
    borderColor = 'white',
    borderWidth = 2,
}: DotMarkerProps) => {
    return (
        <Marker
            position={position}
            icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: size,
                fillColor: color,
                fillOpacity: 1,
                strokeColor: borderColor,
                strokeWeight: borderWidth,
            }}
        />
    );
};

export default DotMarker;
