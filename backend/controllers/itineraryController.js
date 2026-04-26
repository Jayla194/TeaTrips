const { generateItinerary } = require("../itinerary/itineraryGenerator");
const { selectHotel } = require("../itinerary/hotelSelector");
const db = require("../config/db");
const {
    createItinerary,
    createItineraryDays,
    createItineraryStop,
    getUserItineraries,
    getUserItineraryById,
    getItineraryStopsWithLocations,
    updateItineraryHeader,
    deleteItineraryDaysByItineraryId,
    deleteItinerary,
} = require("../models/itineraryModel");
const { getLocationsByCityWithSavedStats } = require("../models/locationModel");

async function generatePublicItinerary(req, res){
    try {
        const cityInput = req.body.city;
        const daysInput = req.body.days;
        const stopsPerDayInput = req.body.stopsPerDay;
        const interests = Array.isArray(req.body.interests) ? req.body.interests : [];
        const includeHotels = Boolean(req.body.includeHotels !== false);

        const city = typeof cityInput === "string" ? cityInput.trim() : "";
        const days = Number(daysInput);
        const stopsPerDay = Number(stopsPerDayInput);
        
        if (!city){
            return res.status(400).json({error:"Please provide a city."});
        }
        if (!Number.isFinite(days) || days < 1 || days > 14){
            return res.status(400).json({error:"Days must be a number between 1 and 14."})
        }
        if (!Number.isFinite(stopsPerDay) || stopsPerDay < 1 || stopsPerDay > 6){
            return res.status(400).json({error:"Stops per day must be a number between 1 and 6."})
        }
        const LocationsInCity = await getLocationsByCityWithSavedStats(city);
        
        const GeneratorInput = {
            city,
            days,
            stopsPerDay,
            interests,
            includeHotels,
        };

        const itineraryJson = generateItinerary( GeneratorInput, LocationsInCity,);
        let hotel = null;
        if (includeHotels){
                hotel = await selectHotel({ city, itinerary: itineraryJson });
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

// Validates start and end dates for trips
function validateBookingDateRange(startDate, endDate, options = {}) {
    const { allowPastDates = false } = options;

    if (!startDate && !endDate) {
        return { ok: true };
    }
    if (!startDate || !endDate) {
        return { ok: false, message: "Please provide both start and end dates." };
    }

    const start = new Date(`${startDate}T00:00:00Z`);
    const end = new Date(`${endDate}T00:00:00Z`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return { ok: false, message: "Invalid trip dates." };
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setUTCFullYear(maxDate.getUTCFullYear() + 2);

    if (!allowPastDates && start < today) {
        return { ok: false, message: "Start date cannot be in the past." };
    }
    if (end < start) {
        return { ok: false, message: "End date cannot be before start date." };
    }
    if (start > maxDate || end > maxDate) {
        return { ok: false, message: "Trips can only be booked up to 2 years in advance." };
    }

    return { ok: true };
}

// Checks if the given date has already passed (compared to today)
function hasDateAlreadyPassed(dateStr) {
    if (!dateStr) return false;
    const date = new Date(`${dateStr}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return false;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return date < today;
}

// Saves itinerary to database if user logged in
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
    const dateValidation = validateBookingDateRange(startDate, endDate);
    if (!dateValidation.ok) {
        return res.status(400).json({ message: dateValidation.message });
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

// Profile page - list of user's saved itineraries
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

// Maps database rows to the format needed for itinerary builder
function mapItineraryRowsToBuilderData(baseItinerary, rows) {
    const dayMap = new Map();

    for (const row of rows) {
        const dayNumber = Number(row.day_number);
        if (!dayMap.has(dayNumber)) {
            dayMap.set(dayNumber, {
                day: dayNumber,
                tripDate: row.trip_date || null,
                stops: [],
            });
        }

        if (row.id) {
            dayMap.get(dayNumber).stops.push({
                id: row.id,
                name: row.name,
                type: row.type,
                lat: row.lat,
                lon: row.lon,
                avgRating: row.avg_rating,
                imageUrl: row.image_url,
                address: row.address,
                city: row.city,
                tags: row.tags,
            });
        }
    }

    const days = Array.from(dayMap.values()).sort((a, b) => a.day - b.day);

    return {
        itineraryId: baseItinerary.itinerary_id,
        tripName: baseItinerary.trip_name,
        startDate: baseItinerary.start_date,
        endDate: baseItinerary.end_date,
        itinerary: {
            meta: {
                city: baseItinerary.city,
                days: days.length,
                stopsPerDay: days[0]?.stops?.length || 3,
            },
            days,
            hotel: baseItinerary.hotel_location_id
                ? {
                    id: baseItinerary.hotel_location_id,
                    name: baseItinerary.hotel_name,
                    type: baseItinerary.hotel_type,
                    lat: baseItinerary.hotel_lat,
                    lon: baseItinerary.hotel_lon,
                    avg_rating: baseItinerary.hotel_avg_rating,
                    image_url: baseItinerary.hotel_image_url,
                    address: baseItinerary.hotel_address,
                    city: baseItinerary.hotel_city,
                }
                : null,
            warnings: [],
        },
    };
}

// Open and edit itinerary if hasn't already happened, otherwise read only
async function getUserItinerary(req, res) {
    const userId = req.user?.user_id;
    const itineraryId = Number(req.params.itineraryId);

    if (!userId) {
        return res.status(401).json({ message: "Login required" });
    }
    if (!Number.isInteger(itineraryId)) {
        return res.status(400).json({ message: "Invalid itinerary id" });
    }

    try {
        const conn = await db.getConnection();
        try {
            const [baseRows] = await conn.query(
                `
                SELECT i.*, h.name AS hotel_name, h.type AS hotel_type, h.lat AS hotel_lat, h.lon AS hotel_lon,
                       h.avg_rating AS hotel_avg_rating, h.image_url AS hotel_image_url,
                       h.address AS hotel_address, h.city AS hotel_city
                FROM itineraries i
                LEFT JOIN locations h ON h.id = i.hotel_location_id
                WHERE i.itinerary_id = ? AND i.user_id = ?
                `,
                [itineraryId, userId],
            );

            const baseItinerary = baseRows[0];
            if (!baseItinerary) {
                return res.status(404).json({ message: "Itinerary not found" });
            }

            const rows = await getItineraryStopsWithLocations(itineraryId, conn);
            return res.json(mapItineraryRowsToBuilderData(baseItinerary, rows));
        } finally {
            conn.release();
        }
    } catch (error) {
        console.error("Error loading itinerary details:", error);
        return res.status(500).json({ message: "Error loading itinerary details" });
    }
}

// Overwrite existing itinerary with updated version
async function updateUserItinerary(req, res) {
    const userId = req.user?.user_id;
    const itineraryId = Number(req.params.itineraryId);

    const tripName = typeof req.body?.tripName === "string" ? req.body.tripName.trim() : "";
    const city = typeof req.body?.city === "string" ? req.body.city.trim() : "";
    const startDate = normaliseDate(req.body?.startDate);
    const endDate = normaliseDate(req.body?.endDate);
    const hotelLocationId = Number(req.body?.hotelLocationId);
    const days = Array.isArray(req.body?.days) ? req.body.days : [];

    if (!userId) {
        return res.status(401).json({ message: "Login required" });
    }
    if (!Number.isInteger(itineraryId)) {
        return res.status(400).json({ message: "Invalid itinerary id" });
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

        const existing = await getUserItineraryById(itineraryId, userId, conn);
        if (!existing) {
            await conn.rollback();
            return res.status(404).json({ message: "Itinerary not found" });
        }

        const existingStartDate = normaliseDate(existing.start_date);
        const existingEndDate = normaliseDate(existing.end_date);

        if (hasDateAlreadyPassed(existingEndDate || existingStartDate)) {
            await conn.rollback();
            return res.status(400).json({ message: "This trip has already happened and is view-only." });
        }

        const dateValidation = validateBookingDateRange(startDate, endDate);
        if (!dateValidation.ok) {
            await conn.rollback();
            return res.status(400).json({ message: dateValidation.message });
        }

        await updateItineraryHeader(conn, {
            itinerary_id: itineraryId,
            user_id: userId,
            trip_name: tripName,
            city,
            start_date: startDate,
            end_date: endDate,
            hotel_location_id: Number.isInteger(hotelLocationId) ? hotelLocationId : null,
        });

        await deleteItineraryDaysByItineraryId(conn, itineraryId);

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
        return res.json({ itinerary_id: itineraryId });
    } catch (error) {
        console.error("Error updating itinerary:", error);
        await conn.rollback();
        return res.status(500).json({ message: "Error updating itinerary" });
    } finally {
        conn.release();
    }
}

// Delete itinerary
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
    getUserItinerary,
    updateUserItinerary,
    removeItinerary,
};
