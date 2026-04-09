const locationModel = require("../models/locationModel");
const { similarLocations } = require("../recommendations/similarLocations");
const { getOrGenerateDescription } = require("../utils/aiDescription");


// Get all locations api/locations
async function getAll(req,res){
    try {
        const data = await locationModel.getAllLocations();
        res.json(data);
    } catch (err){
        res.status(500).json({error:"database error"});
    }
};

// Get all unique cities api/locations/cities
async function getCities(req,res){
    try {
        const cities = await locationModel.getAllCities();
        res.json(cities);
    } catch (err) {
        res.status(500).json({ error: "database error" });
    }
};

// Get Location By ID api/locations/id
async function getById(req,res){
    try{
        const location = await locationModel.getLocationById(req.params.id);

        if(!location){
            return res.status(404).json({error: "location not found"});
        }
        res.json(location);
        } catch (err){
            res.status(500).json({error:"database error"});
        }

};
// Get locations by city with saved stats api/locations/city/:city
async function getByCityWithSavedStats(req,res){
    const city = req.params.city;
    try {
        const locations = await locationModel.getLocationsByCityWithSavedStats(city);
        res.json(locations);
    } catch (err) {
        res.status(500).json({ error: "database error" });
    }
}
// Get popular locations api/locations/popular
async function getPopularLocations(req,res){
    try {
        const locations = await locationModel.getPopularLocations();
        res.json(locations);
    } catch (err) {
        res.status(500).json({ error: "database error" });
    }
}

// Get similar locations api/locations/id/similar
async function getSimilarLocations(req,res){
    try{
        const id = req.params.id;
        const limit = Math.max(1,Math.min(20, parseInt(req.query.limit) || 6));
        const current = await locationModel.getLocationById(id);
        if(!current){
            return res.status(404).json({error: "location not found"});
        }
        const allLocations = await locationModel.getAllLocations();
        const similar = similarLocations(current, allLocations, limit);
        res.json(similar);
    }catch (err){
        res.status(500).json({error:"database error"});
    }
}

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

module.exports = {
    getAll,
    getCities,
    getById,
    getByCityWithSavedStats,
    getPopularLocations,
    getSimilarLocations,
    getDescription,
};
