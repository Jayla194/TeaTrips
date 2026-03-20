// Connector between database, generator and response
// Controller Reads Request, Validates Input, Fetches the Data, Calls Generator and returns a JSON

const { generateItinerary } = require("../itinerary/itineraryGenerator");
const { getLocationsByCity } = require("../models/locationModel");
const { selectHotel } = require("../itinerary/hotelSelector");
const db = require("../config/db");
const {
    createItinerary,
    createItineraryDays,
    createItineraryStop,
    getUserItineraries,
    deleteItinerary,
} = require("../models/itineraryModel");
const { getLocationsByCityWithSavedStats } = require("../models/locationModel");


// For logged out users with no preferences
async function generatePublicItinerary(req, res){
    try {
        // Reads input from frontend
        const cityInput = req.body.city;
        const daysInput = req.body.days;
        const seedInput = req.body.seed;
        const stopsPerDayInput = req.body.stopsPerDay;
        const interests = Array.isArray(req.body.interests) ? req.body.interests : [];
        // Default to true unless user sets to false
        const includeHotels = Boolean(req.body.includeHotels !== false);
        
        // Used Later
        const budget = req.body.budget;


        // Validate Input
        const city = typeof cityInput === "string" ? cityInput.trim() : "";
        const days = Number(daysInput);
        const stopsPerDay = Number(stopsPerDayInput);
        // If no seed provided, create one to generate something different
        const seed = seedInput ? Number(seedInput) : Math.floor(Math.random()* 1000000);
        
        if (!city){
            return res.status(400).json({error:"Please provide a city."});
        }
        if (!Number.isFinite(days) || days < 1 || days > 14){
            return res.status(400).json({error:"Days must be a number between 1 and 14."})
        }
        if (!Number.isFinite(stopsPerDay) || stopsPerDay < 1 || stopsPerDay > 6){
            return res.status(400).json({error:"Stops per day must be a number between 1 and 6."})
        }
        // Fetch all locations in specified city with saved count
        const LocationsInCity = await getLocationsByCityWithSavedStats(city);
        
        // Call generator
        const GeneratorInput = {
            city,
            days,
            stopsPerDay,
            seed,
            interests,
            includeHotels,
        };

        // Return itinerary json to frontend
        const itineraryJson = generateItinerary( GeneratorInput, LocationsInCity,);

        // Include hotel recommendation if requested by user
        let hotel = null;
        if (includeHotels){
                hotel = await selectHotel({city, itinerary:itineraryJson, seed});
        }
        
        return res.json({ ...itineraryJson, hotel });


    }catch (error){
        console.error("Error in generatePublicItinerary: ",error);
        return res.status(500).json({error:"Server error while generative itinerary."});
    }
}

function normaliseDate(dateStr) {
    if (!dateStr) return null;
    const date = new Date(`${dateStr}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().slice(0, 10);
}

function addDaysIso(startDate, offsetDays) {
    if (!startDate) return null;
    const base = new Date(`${startDate}T00:00:00Z`);
    if (Number.isNaN(base.getTime())) return null;
    const next = new Date(base.getTime() + offsetDays * 24 * 60 * 60 * 1000);
    return next.toISOString().slice(0, 10);
}

async function saveItinerary(req, res) {
    const userId = req.user?.user_id;

    const tripName = typeof req.body?.tripName === "string" ? req.body.tripName.trim() : "";
    const city = typeof req.body?.city === "string" ? req.body.city.trim() : "";
    const startDate = normaliseDate(req.body?.startDate);
    const endDate = normaliseDate(req.body?.endDate);
    const hotelLocationId = Number(req.body?.hotelLocationId);
    const days = Array.isArray(req.body?.days) ? req.body.days : [];

    if (!userId) {
        return res.status(401).json({ message: "Login required" });
    }
    if (!tripName) {
        return res.status(400).json({ message: "Trip name is required" });
    }
    if (!city) {
        return res.status(400).json({ message: "City is required" });
    }
    if (days.length === 0) {
        return res.status(400).json({ message: "Itinerary must have at least one day" });
    }

    for (const day of days) {
        if (!Number.isInteger(day?.dayNumber)) {
            return res.status(400).json({ message: "Invalid day number" });
        }
        const stops = Array.isArray(day?.stops) ? day.stops : [];
        for (const stop of stops) {
            if (!Number.isInteger(stop?.locationId)) {
                return res.status(400).json({ message: "Invalid location in stops" });
            }
        }
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const insertResult = await createItinerary(
            {
                user_id: userId,
                trip_name: tripName,
                city,
                start_date: startDate,
                end_date: endDate,
                hotel_location_id: Number.isInteger(hotelLocationId) ? hotelLocationId : null,
            },
            conn,
        );

        const itineraryId = insertResult.insertId;

        for (const day of days) {
            const dayNumber = Number(day.dayNumber);
            const tripDate = day.tripDate || addDaysIso(startDate, dayNumber - 1);

            const dayResult = await createItineraryDays(conn, {
                itinerary_id: itineraryId,
                day_number: dayNumber,
                trip_date: tripDate,
            });

            const itineraryDayId = dayResult.insertId;
            const stops = Array.isArray(day?.stops) ? day.stops : [];

            for (let i = 0; i < stops.length; i += 1) {
                const stop = stops[i];
                await createItineraryStop(conn, {
                    itinerary_day_id: itineraryDayId,
                    location_id: stop.locationId,
                    stop_position: Number.isInteger(stop.stopPosition) ? stop.stopPosition : i + 1,
                    start_time: stop.startTime || null,
                    end_time: stop.endTime || null,
                    notes: stop.notes || null,
                });
            }
        }

        await conn.commit();
        return res.status(201).json({ itinerary_id: itineraryId });
    } catch (error) {
        console.error("Error saving itinerary:", error);
        await conn.rollback();
        return res.status(500).json({ message: "Error saving itinerary" });
    } finally {
        conn.release();
    }
}

async function listUserItineraries(req, res) {
    const userId = req.user?.user_id;
    if (!userId) {
        return res.status(401).json({ message: "Login required" });
    }

    try {
        const rows = await getUserItineraries(userId);
        return res.json(rows);
    } catch (error) {
        console.error("Error loading itineraries:", error);
        return res.status(500).json({ message: "Error loading itineraries" });
    }
}

async function removeItinerary(req, res) {
    const userId = req.user?.user_id;
    const itineraryId = Number(req.params.itineraryId);

    if (!userId) {
        return res.status(401).json({ message: "Login required" });
    }
    if (!Number.isInteger(itineraryId)) {
        return res.status(400).json({ message: "Invalid itinerary id" });
    }

    try {
        const result = await deleteItinerary(itineraryId, userId);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Itinerary not found" });
        }
        return res.json({ message: "Itinerary removed" });
    } catch (error) {
        console.error("Error deleting itinerary:", error);
        return res.status(500).json({ message: "Error deleting itinerary" });
    }
}

module.exports = {
    generatePublicItinerary,
    saveItinerary,
    listUserItineraries,
    removeItinerary,
};
