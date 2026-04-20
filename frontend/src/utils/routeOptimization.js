function getStopCoords(stop) {
    const lat = Number(stop?.lat);
    const lon = Number(stop?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { lat, lon };
}

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

export function routeDistanceKm(stops) {
    if (!Array.isArray(stops) || stops.length < 2) return 0;

    let total = 0;
    for (let i = 1; i < stops.length; i += 1) {
        const prevCoords = getStopCoords(stops[i - 1]);
        const nextCoords = getStopCoords(stops[i]);
        if (!prevCoords || !nextCoords) continue;
        total += haversineDistanceKm(prevCoords, nextCoords);
    }
    return total;
}

// Nearest-neighbour ordering with a light 2-opt pass.
export function optimizeDayStopOrder(dayStops, hotel) {
    if (!Array.isArray(dayStops) || dayStops.length < 3) return dayStops;

    const geoStops = dayStops.filter((stop) => getStopCoords(stop));
    const nonGeoStops = dayStops.filter((stop) => !getStopCoords(stop));
    if (geoStops.length < 3) return dayStops;

    const hotelCoords = getStopCoords(hotel);
    let startIndex = 0;

    if (hotelCoords) {
        let bestDistance = Number.POSITIVE_INFINITY;
        for (let i = 0; i < geoStops.length; i += 1) {
            const candidateCoords = getStopCoords(geoStops[i]);
            if (!candidateCoords) continue;
            const distance = haversineDistanceKm(hotelCoords, candidateCoords);
            if (distance < bestDistance) {
                bestDistance = distance;
                startIndex = i;
            }
        }
    }

    const remaining = geoStops.slice();
    const route = [];
    const [start] = remaining.splice(startIndex, 1);
    route.push(start);

    while (remaining.length > 0) {
        const lastStop = route[route.length - 1];
        const lastCoords = getStopCoords(lastStop);
        if (!lastCoords) break;

        let nearestIndex = 0;
        let nearestDistance = Number.POSITIVE_INFINITY;
        for (let i = 0; i < remaining.length; i += 1) {
            const candidateCoords = getStopCoords(remaining[i]);
            if (!candidateCoords) continue;
            const distance = haversineDistanceKm(lastCoords, candidateCoords);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestIndex = i;
            }
        }

        const [next] = remaining.splice(nearestIndex, 1);
        route.push(next);
    }

    let improved = true;
    let bestRoute = route.slice();
    while (improved && bestRoute.length >= 4) {
        improved = false;
        const currentDistance = routeDistanceKm(bestRoute);

        for (let i = 1; i < bestRoute.length - 2; i += 1) {
            for (let k = i + 1; k < bestRoute.length - 1; k += 1) {
                const candidate = [
                    ...bestRoute.slice(0, i),
                    ...bestRoute.slice(i, k + 1).reverse(),
                    ...bestRoute.slice(k + 1),
                ];

                if (routeDistanceKm(candidate) + 0.01 < currentDistance) {
                    bestRoute = candidate;
                    improved = true;
                }
            }
        }
    }

    return [...bestRoute, ...nonGeoStops];
}

function optimizeGlobalStopOrder(stops, hotel) {
    if (!Array.isArray(stops) || stops.length < 3) return Array.isArray(stops) ? stops : [];

    const geoStops = stops.filter((stop) => getStopCoords(stop));
    const nonGeoStops = stops.filter((stop) => !getStopCoords(stop));
    if (geoStops.length < 3) return stops;

    const hotelCoords = getStopCoords(hotel);
    let startIndex = 0;
    if (hotelCoords) {
        let bestDistance = Number.POSITIVE_INFINITY;
        for (let i = 0; i < geoStops.length; i += 1) {
            const coords = getStopCoords(geoStops[i]);
            if (!coords) continue;
            const distance = haversineDistanceKm(hotelCoords, coords);
            if (distance < bestDistance) {
                bestDistance = distance;
                startIndex = i;
            }
        }
    }

    const remaining = geoStops.slice();
    const route = [];
    const [start] = remaining.splice(startIndex, 1);
    route.push(start);

    while (remaining.length > 0) {
        const last = route[route.length - 1];
        const lastCoords = getStopCoords(last);
        if (!lastCoords) break;

        let nearestIndex = 0;
        let nearestDistance = Number.POSITIVE_INFINITY;
        for (let i = 0; i < remaining.length; i += 1) {
            const coords = getStopCoords(remaining[i]);
            if (!coords) continue;
            const distance = haversineDistanceKm(lastCoords, coords);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestIndex = i;
            }
        }

        const [next] = remaining.splice(nearestIndex, 1);
        route.push(next);
    }

    return [...route, ...nonGeoStops];
}

// Re-cluster across days while keeping original day stop counts.
export function optimizeItineraryByDayCounts(days, hotel) {
    if (!Array.isArray(days) || days.length === 0) return Array.isArray(days) ? days : [];

    const dayCounts = days.map((day) => Array.isArray(day?.stops) ? day.stops.length : 0);
    const allStops = days.flatMap((day) => (Array.isArray(day?.stops) ? day.stops : []));
    if (allStops.length < 3) return days;

    const globalOrdered = optimizeGlobalStopOrder(allStops, hotel);
    let cursor = 0;

    return days.map((day, dayIndex) => {
        const count = dayCounts[dayIndex];
        const slice = globalOrdered.slice(cursor, cursor + count);
        cursor += count;
        return {
            ...day,
            stops: optimizeDayStopOrder(slice, hotel),
        };
    });
}
