import { MapContainer, TileLayer , Marker, Popup, useMap} from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiUrl } from "../utils/api";
import { getDayColour } from "../utils/dayColours";

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

function FitToLocations({ locations }){
    const map = useMap();
    useEffect(() => {
        if(!Array.isArray(locations ) ||  locations.length === 0) return;
        const bounds = L.latLngBounds(
            locations.map((loc) => [Number(loc.lat),Number(loc.lon)])
        );

        map.fitBounds(bounds, {padding:[40,40], maxZoom:13});
    }, [locations,map]);

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
    loc => !isNaN(Number(loc.lat)) && !isNaN(Number(loc.lon))
    );

    // Single Location context for Location Details page
    const selectedLocation = mode === "single" && activeId
    ? validLocations.find(loc => loc.id === Number(activeId))
    : null;

    // Decide which markers are shown
    const markersToShow = mode === "single" && selectedLocation ? [selectedLocation] : validLocations;

    function createDayIcon(colour) {
        return L.divIcon({
            className: "tt-day-marker-wrap",
            html: `
                <div class="tt-day-marker" style="--marker-color:${colour}">
                    <span class="tt-day-marker-dot"></span>
                </div>
            `,
            iconSize: [26, 36],
            iconAnchor: [13, 36],
            popupAnchor: [0, -34],
        });
    }

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

        {mode ==="multiple" && markersToShow.length > 0 &&(
            <FitToLocations locations={markersToShow} />
        )}

        {showMarkers && markersToShow.map((location) => {
            const colour = getDayColour(location.day);
            return (
                <Marker
                    key={location.id}
                    position={[Number(location.lat), Number(location.lon)]}
                    icon={createDayIcon(colour)}
                >
                    <Popup>
                        <strong>{location.name}</strong>
                        {location.day ? <div>Day {location.day}</div> : null}
                    </Popup>
                </Marker>
            );
        })}
        </MapContainer>
    );
}
