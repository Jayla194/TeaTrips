// Connector between database, generator and response
// Controller Reads Request, Validates Input, Fetches the Data, Calls Generator and returns a JSON

const { generateItinerary } = require("../itinerary/itineraryGenerator");
const { getLocationsByCity } = require("../models/locationModel");
const { selectHotel } = require ("../itinerary/hotelSelector");

function parseInt(val,fallback){
    const n = Number.parseInt(val, 10);
        return Number.isFinite(n) ? n:fallback;
    
}


// For logged out users with no preferences
async function generatePublicItinerary(req, res){
    try {
        // Reads input from frontend
        const cityInput = req.body.city;
        const daysInput = req.body.days;
        const seedInput = req.body.seed;
        const stopsPerDay = 3;


        // Validate Input
        const city = typeof cityInput === "string" ? cityInput.trim() : "";
        const days = Number(daysInput);
        // If no seed provided, create one to generate something different
        const seed = seedInput ? Number(seedInput) : Math.floor(Math.random()* 1000000);
        
        if (!city){
            return res.status(400).json({error:"Please provide a city."});
        }
        if (!Number.isFinite(days) || days < 1 || days > 14){
            return res.status(400).json({error:"Days must be a number between 1 and 14."})
        }
        // Fetch all locations in specified city
        const LocationsInCity = await getLocationsByCity(city);
        // Call generator
        const GeneratorInput = {
            city,
            days,
            stopsPerDay,
            seed
        };

        // Return itinerary json to frontend
        const itineraryJson = generateItinerary( GeneratorInput, LocationsInCity,);

        const hotel = await selectHotel({city, itinerary:itineraryJson, seed});


        return res.json({ ...itineraryJson, hotel });


    }catch (error){
        console.error("Error in generatePublicItinerary: ",error);
        return res.status(500).json({error:"Server error while generative itinerary."});
    }
}

module.exports = {generatePublicItinerary};