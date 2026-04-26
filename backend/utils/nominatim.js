const axios = require("axios");
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

// Build a query string from values
function buildQuery(parts) {
    return parts
        .map((part) => String(part || "").trim())
        .filter(Boolean)
        .join(", ");
}

function getQueryVariants({ name, address, city, postcode }) {
    // Try most-specific first, then progressively simpler fallbacks
    // This improves match rates
    return [
        buildQuery([name, address, city, postcode]),
        buildQuery([address, city, postcode]),
        buildQuery([name, address, city]),
        buildQuery([address, city]),
        buildQuery([postcode, city]),
        buildQuery([postcode]),
    ].filter(Boolean);
}

// Geocode a location using Nominatim API
async function geocodeLocation({ name, address, city, postcode }) {
    const queries = getQueryVariants({ name, address, city, postcode });

    if (queries.length === 0) {
        return null;
    }

    for (const query of queries) {
        //  Use the top match returned
        const response = await axios.get(NOMINATIM_URL, {
            params: {
                q: query,
                format: "jsonv2",
                limit: 3,
                addressdetails: 1,
                countrycodes: "gb",
                "accept-language": "en",
            },
            headers: {
                "User-Agent": "TeaTrips/1.0",
                Accept: "application/json",
            },
            timeout: 10000,
        });

        const match = response.data?.[0];

        if (match) {
            return {
                lat: Number(match.lat),
                lon: Number(match.lon),
                displayName: match.display_name,
                queryUsed: query,
            };
        }
    }

    return null;
}

module.exports = {
    geocodeLocation,
};