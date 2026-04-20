// Route optimisation helpers for itinerary planning.

// Checks if a stop has valid lat/lon and combines them into a single object
function toCoords(stop) {
    const lat = Number(stop?.lat);
    const lon = Number(stop?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { lat, lon };
}

// Calculate the Haversine distance between two points
function haversineKm(a, b) {
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

// Calculate total route distance, summing distances between consecutive stops.
export function routeDistanceKm(stops) {
    if (!Array.isArray(stops) || stops.length < 2) return 0;

    let total = 0;
    for (let i = 1; i < stops.length; i += 1) {
        const from = toCoords(stops[i - 1]);
        const to = toCoords(stops[i]);
        if (!from || !to) continue;
        total += haversineKm(from, to);
    }
    return total;
}

// Find the index of the candidate stop nearest to the fromStop
function findNearestIndex(fromStop, candidates) {
    const fromCoords = toCoords(fromStop);
    if (!fromCoords || candidates.length === 0) return 0;

    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let i = 0; i < candidates.length; i += 1) {
        const candidateCoords = toCoords(candidates[i]);
        if (!candidateCoords) continue;

        const distance = haversineKm(fromCoords, candidateCoords);
        if (distance < bestDistance) {
            bestDistance = distance;
            bestIndex = i;
        }
    }

    return bestIndex;
}

// Order stops using a nearest neighbour
function orderByNearestNeighbour(stops, startStop = null) {
    if (!Array.isArray(stops) || stops.length < 2) return Array.isArray(stops) ? stops.slice() : [];

    const remaining = stops.slice();
    const route = [];

    let startIndex = 0;
    if (startStop) {
        startIndex = findNearestIndex(startStop, remaining);
    }

    const [first] = remaining.splice(startIndex, 1);
    route.push(first);

    while (remaining.length > 0) {
        const current = route[route.length - 1];
        const nextIndex = findNearestIndex(current, remaining);
        const [next] = remaining.splice(nextIndex, 1);
        route.push(next);
    }

    return route;
}


function reverseSegment(route, fromIndex, toIndex) {
    return [
        ...route.slice(0, fromIndex),
        ...route.slice(fromIndex, toIndex + 1).reverse(),
        ...route.slice(toIndex + 1),
    ];
}

// Iteratively reverse parts of the route to find a shorter path
function twoOptImprove(route, maxPasses = 2) {
    let best = route.slice();
    let bestDistance = routeDistanceKm(best);

    for (let pass = 0; pass < maxPasses; pass += 1) {
        let improved = false;

        for (let i = 1; i < best.length - 2; i += 1) {
            for (let k = i + 1; k < best.length - 1; k += 1) {
                const candidate = reverseSegment(best, i, k);
                const candidateDistance = routeDistanceKm(candidate);

                if (candidateDistance + 0.01 < bestDistance) {
                    best = candidate;
                    bestDistance = candidateDistance;
                    improved = true;
                }
            }
        }

        if (!improved) break;
    }

    return best;
}

// Optimise the order of stops within a single day
export function optimiseDayStopOrder(dayStops, hotel) {
    if (!Array.isArray(dayStops) || dayStops.length < 3) return dayStops;

    const geoStops = dayStops.filter((stop) => toCoords(stop));
    const nonGeoStops = dayStops.filter((stop) => !toCoords(stop));

    if (geoStops.length < 3) return dayStops;

    const hotelOrNull = toCoords(hotel) ? hotel : null;
    const nearestOrdered = orderByNearestNeighbour(geoStops, hotelOrNull);
    const improved = twoOptImprove(nearestOrdered, 2);

    // Keep stops without coordinates, but place them last.
    return [...improved, ...nonGeoStops];
}

// Optimise the order of all stops in the itinerary, ignoring day boundaries, then re-map to days in original ordering.
export function optimiseGlobalStopOrder(stops, hotel) {
    if (!Array.isArray(stops) || stops.length < 3) return Array.isArray(stops) ? stops : [];

    const geoStops = stops.filter((stop) => toCoords(stop));
    const nonGeoStops = stops.filter((stop) => !toCoords(stop));
    if (geoStops.length < 3) return stops;

    const hotelOrNull = toCoords(hotel) ? hotel : null;
    const nearestOrdered = orderByNearestNeighbour(geoStops, hotelOrNull);
    const improved = twoOptImprove(nearestOrdered, 2);
    return [...improved, ...nonGeoStops];
}

// Re-cluster stops across days while keeping each day's original stop count.
export function optimiseItineraryByDayCounts(days, hotel) {
    if (!Array.isArray(days) || days.length === 0) return Array.isArray(days) ? days : [];

    const dayCounts = days.map((day) => (Array.isArray(day?.stops) ? day.stops.length : 0));
    const allStops = days.flatMap((day) => (Array.isArray(day?.stops) ? day.stops : []));
    if (allStops.length < 3) return days;

    const globallyOrdered = optimiseGlobalStopOrder(allStops, hotel);
    let cursor = 0;

    return days.map((day, index) => {
        const count = dayCounts[index];
        const daySlice = globallyOrdered.slice(cursor, cursor + count);
        cursor += count;

        return {
            ...day,
            stops: optimiseDayStopOrder(daySlice, hotel),
        };
    });
}
