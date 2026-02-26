const locationModel = require("../models/locationModel");


// Get all Locations api/locations
exports.getAll = async (req,res) =>{
    try {
        const data = await locationModel.getAllLocations();
        res.json(data);
    } catch (err){
        console.error(err);
        res.status(500).json({error:"database error"});
    }
};

// Get Location By ID api/locations/id
exports.getById = async (req,res) => {
    try{
        const location = await locationModel.getLocationById(req.params.id);
    
        if(!location){
            return res.status(404).json({error: "location not found"});
        }
        res.json(location);
        } catch (err){
            console.error("getLocationById error:",err);
            res.status(500).json({error:"database error"});
        }
    
};