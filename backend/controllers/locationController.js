const locationModel = require("../models/locationModel");
const { similarLocations } = require("../recommendations/similarLocations");
const { getOrGenerateDescription } = require("../utils/aiDescription");
const { geocodeLocation } = require("../utils/nominatim");

const DATABASE_ERROR = { error: "database error" };

// Get all locations api/locations
async function getAll(req, res) {
    try {
        const data = await locationModel.getAllLocations();
        res.json(data);
    } catch (err) {
        res.status(500).json(DATABASE_ERROR);
    }
}

// Get all unique cities api/locations/cities
async function getCities(req, res) {
    try {
        const cities = await locationModel.getAllCities();
        res.json(cities);
    } catch (err) {
        res.status(500).json(DATABASE_ERROR);
    }
}

// Get Location By ID api/locations/id
async function getById(req, res) {
    try {
        const location = await locationModel.getLocationById(req.params.id);

        if (!location) {
            return res.status(404).json({ error: "location not found" });
        }

        res.json(location);
    } catch (err) {
        res.status(500).json(DATABASE_ERROR);
    }
}

// Get locations by city with saved stats api/locations/city/:city
async function getByCityWithSavedStats(req, res) {
    const city = req.params.city;

    try {
        const locations = await locationModel.getLocationsByCityWithSavedStats(city);
        res.json(locations);
    } catch (err) {
        res.status(500).json(DATABASE_ERROR);
    }
}

// Get popular locations api/locations/popular
async function getPopularLocations(req, res) {
    try {
        const locations = await locationModel.getPopularLocations();
        res.json(locations);
    } catch (err) {
        res.status(500).json(DATABASE_ERROR);
    }
}

// Get similar locations api/locations/id/similar
async function getSimilarLocations(req, res) {
    try {
        const id = req.params.id;
        const limit = Math.max(1, Math.min(20, parseInt(req.query.limit, 10) || 6));
        const current = await locationModel.getLocationById(id);

        if (!current) {
            return res.status(404).json({ error: "location not found" });
        }

        const allLocations = await locationModel.getAllLocations();
        const similar = similarLocations(current, allLocations, limit);
        res.json(similar);
    }catch (err){
        res.status(500).json({error:"database error"});
    }
}

// get or generate location description api/locations/id/description
async function getDescription(req, res) {
    try {
        const locationId = req.params.id;
        const description = await getOrGenerateDescription(locationId);

        if (!description) {
            return res.status(404).json({ error: "location not found" });
        }

        res.json({ id: locationId, description });
    } catch (err) {
        console.error("getDescription error:", err);
        res.status(500).json({ error: "database error" });
    }
}

// Create a new location api/locations (admin only)
async function createLocation(req, res) {
    try {
        const name = req.body?.name;
        const type = req.body?.type;
        const address = req.body?.address;
        const city = req.body?.city;
        const postcode = req.body?.postcode;

        if (!name || !type || !address || !city || !postcode) {
            return res.status(400).json({
                error: "name, type, address, city, and postcode are required",
            });
        }

        let lat = Number(req.body?.lat);
        let lon = Number(req.body?.lon);
        let geocodeSource = "manual";

        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
            const geocoded = await geocodeLocation({ name, address, city, postcode });

            if (!geocoded) {
                return res.status(422).json({
                    error: "Unable to geocode the provided address",
                });
            }

            lat = geocoded.lat;
            lon = geocoded.lon;
            geocodeSource = "nominatim";
        }

        const payload = {
            name,
            type,
            address,
            city,
            postcode,
            lat,
            lon,
            website: req.body?.website || null,
            phone: req.body?.phone || null,
            opening_hours: req.body?.opening_hours || null,
            price_tier: req.body?.price_tier ?? null,
            avg_rating: req.body?.avg_rating ?? null,
            suggested_duration: req.body?.suggested_duration ?? null,
            tags: req.body?.tags || null,
            image_url: req.body?.image_url || null,
            description_short: req.body?.description_short || null,
            description_long: null,
            description_last_generated: null,
            review_count_at_generation: null,
        };

        const id = await locationModel.addLocation(payload);

        res.status(201).json({
            message: "Location created",
            location: {
                ...payload,
                id,
                geocodeSource,
            },
        });
    } catch (err) {
        console.error("createLocation error:", err);
        res.status(500).json({ error: "database error" });
    }
}

// Update Location (admin only)
async function updateLocation(req, res) {
    try {
        const locationId = req.params.id;
        const existing = await locationModel.getLocationById(locationId);

        if (!existing) {
            return res.status(404).json({ error: "location not found" });
        }

        const payload = {
            name: req.body?.name ?? existing.name,
            type: req.body?.type ?? existing.type,
            address: req.body?.address ?? existing.address,
            city: req.body?.city ?? existing.city,
            postcode: req.body?.postcode ?? existing.postcode,
            lat: req.body?.lat ?? existing.lat,
            lon: req.body?.lon ?? existing.lon,
            website: req.body?.website ?? existing.website,
            phone: req.body?.phone ?? existing.phone,
            opening_hours: req.body?.opening_hours ?? existing.opening_hours,
            price_tier: req.body?.price_tier ?? existing.price_tier,
            avg_rating: req.body?.avg_rating ?? existing.avg_rating,
            suggested_duration: req.body?.suggested_duration ?? existing.suggested_duration,
            tags: req.body?.tags ?? existing.tags,
            image_url: req.body?.image_url ?? existing.image_url,
            description_short: req.body?.description_short ?? existing.description_short,
        };

        await locationModel.updateLocation(locationId, payload);

        res.json({
            message: "Location updated",
            location: {
                ...payload,
                id: locationId,
            },
        });
    } catch (err) {
        console.error("updateLocation error:", err);
        res.status(500).json(DATABASE_ERROR);
    }
}

module.exports = {
    getAll,
    getCities,
    getById,
    getByCityWithSavedStats,
    getPopularLocations,
    getSimilarLocations,
    getDescription,
    createLocation,
    updateLocation,
};
