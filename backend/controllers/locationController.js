const locationModel = require("../models/locationModel");


// Get all Locations api/locations
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

async function getByCityWithSavedStats(req,res){
    const city = req.params.city;
    try {
        const locations = await locationModel.getLocationsByCityWithStats(city);
        res.json(locations);
    } catch (err) {
        res.status(500).json({ error: "database error" });
    }
}

module.exports = {
    getAll,
    getCities,
    getById,
    getByCityWithSavedStats
};

