import { MapContainer, TileLayer , Marker, Popup, useMap} from "react-leaflet";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiUrl } from "../utils/api";

function GoToLocation({ location }) {
    const map = useMap();

    useEffect(() => {
        if (!location) return;

        map.setView(
        [Number(location.lat), Number(location.lon)],
        14,
        { animate: true }
        );
    }, [location, map]);

    return null;
}

// Renders an interactive map that adapts to different page contexts
// (single location on details pages, multiple locations for itineraries)
export default function MapView({
    mode="multiple",
    selectedId = null,
    locationsOverride = null,
    showMarkers = true
}){

    const params = useParams();
    const routeId = params.id;

    //Decides which ID controls the map
    const activeId = selectedId ?? routeId;
    const [locations, setLocations] = useState([]);


    //Load locations if specified if not, load full dataset.
    useEffect(() => {
        if (locationsOverride){
            setLocations(locationsOverride);
            return;
        }

        fetch(apiUrl("/api/locations"))
        .then(res => res.json())
        .then(data => setLocations(data));
    }, [locationsOverride]);

    //Check if location coordinates are valid
    const validLocations = locations.filter(
    loc => !isNaN(loc.lat) && !isNaN(loc.lon)
    );

    // Single Location context for Location Details page
    const selectedLocation = mode === "single" && activeId
    ? validLocations.find(loc => loc.id === Number(activeId))
    : null;

    // Decide which markers are shown
    const markersToShow = mode === "single" && selectedLocation ? [selectedLocation] : validLocations;

    return (
        <MapContainer
        center={[51.5074, -0.1278]}
        zoom={mode === "single" ? 12 : 6}
        style={{ height: mode === "single" ? "100%" : "80vh", width: "100%" }}
        >
        <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {selectedLocation && <GoToLocation location={selectedLocation} />}

        {showMarkers && markersToShow.map((location) => (
        <Marker
            key={location.id}
            position={[
                Number(location.lat),
                Number(location.lon),
            ]}>

            <Popup>
                {location.name}
            </Popup>
            </Marker>
        ))}
        </MapContainer>
    );
}
