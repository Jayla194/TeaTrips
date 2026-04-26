const { getHotelsByCity } = require("../models/locationModel");

// Picks a hotel for the given city by minimizing average distance to all stops

// Converts lat and lon to a coordinate
function toPoint(x) {
    const lat = Number(x?.lat);
    const lon = Number(x?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { lat, lon };
}

// Calculates distance between 2 points
function haversineDistanceKm(a, b) {
    const toRadians = (degrees) => (degrees * Math.PI) / 180;
    const earthRadiusKm = 6371;

    const dLat = toRadians(b.lat - a.lat);
    const dLon = toRadians(b.lon - a.lon);
    const lat1 = toRadians(a.lat);
    const lat2 = toRadians(b.lat);

    const h =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

// Selects the best hotel for the given city and itinerary
async function selectHotel({ city, itinerary }) {
    const hotels = await getHotelsByCity(city);
    if (!hotels.length) return null;

    const allStops = itinerary?.days?.flatMap((day) => day?.stops ?? []) ?? [];

    const geoStops = allStops.map(toPoint).filter(Boolean);
    if (geoStops.length === 0) {
        return hotels[0];
    }

    let bestHotel = null;
    let bestScore = null;

    for (const hotel of hotels) {
        const hotelPoint = toPoint(hotel);
        if (!hotelPoint) continue;

        let totalDistance = 0;
        for (const stopPoint of geoStops) {
            totalDistance += haversineDistanceKm(hotelPoint, stopPoint);
        }

        const avgDistance = totalDistance / geoStops.length;
        if (bestScore === null || avgDistance < bestScore) {
            bestScore = avgDistance;
            bestHotel = hotel;
        }
    }

    return bestHotel ?? hotels[0];
}

module.exports = { selectHotel };
