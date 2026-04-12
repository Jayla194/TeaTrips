// Same mapping from category mapping to stay consistent with frontend
const INTEREST_TAGS = {
    "Cultural": ["museum", "gallery", "art"],
    "Historical": ["history", "castle"],
    "Food & Cafes": ["restaurant", "food", "cafe", "market", "pub"],
    "Attractions": ["attraction", "museum", "history", "castle", "gallery", "zoo", "theme park", "art"],
    "Entertainment": ["theatre", "music venue", "sport venue", "entertainment"],
    "Nature": ["nature", "park"],
};



// Notes:
// Find difference between start date and end date for num of days
// Calculate total locations needed for each day
// filter locations by city
// fill remaining slots with non-saved locations
// distribute locations evenly across days
// return itinerary object




// Stack Overflow (2020). Seeding the random number generator in JavaScript.
// Available at: https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript

function createSeededRandom(seed){
    let internalState = seed >>> 0;

    return function random(){
        internalState += 0x6D2B79F5;

        let temp = internalState;
        temp = Math.imul(temp ^ (temp >>> 15), temp | 1);
        temp ^= temp + Math.imul(temp ^ (temp >>> 7), temp | 61);

        return ((temp ^ (temp >>> 14)) >>> 0) /  4294967296;
    };
}

// Shuffle Locations in a controlled random way based on random seed#
function shuffleWithSeed(array, seed){
    const random = createSeededRandom(seed);

    const shuffled = array.slice();

    for(let i = shuffled.length -1; i> 0; i--){
        const j = Math.floor(random() * (i+1));

        const temp = shuffled [i];
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
    }
    return shuffled;
}


// Weighted sampling without replacement based on popularity weight and user interests
function weightedSampleWithoutReplacement(items, weights, sampleSize, rand){
    const selected = [];
    const itemsCopy = items.slice();
    const weightsCopy = weights.slice();
    
    // If weights are all zero (e.g. no ratings/saves), fallback to uniform random selection
    for (let k = 0; k < sampleSize && itemsCopy.length > 0; k++){
        const totalWeight = weightsCopy.reduce((sum, w) => sum + w, 0);
        if (totalWeight <= 0) {
            // uniform pick
            const idx = Math.floor(rand() * itemsCopy.length);
            selected.push(itemsCopy[idx]);
            itemsCopy.splice(idx, 1);
            weightsCopy.splice(idx, 1);
            continue;
        }
        
        let r = rand() * totalWeight;
        let acc= 0;
        let selectedIndex = 0;

        // Iterate through weights to find the selected item
        for (let i = 0; i < weightsCopy.length; i++){
            acc += weightsCopy[i];
            if (r < acc){
                selectedIndex = i;
                break;
            }
        }
        // Add selected item to result and remove from pool
        selected.push(itemsCopy[selectedIndex]);
        itemsCopy.splice(selectedIndex, 1);
        weightsCopy.splice(selectedIndex, 1);
    }
    return selected;
}

// Calculate a popularity weight for a location based on rating and saved count
function getPopularityWeight(location){
    const rating = Number(location?.avg_rating || 0);
    const saved = Number(location?.saved_count || 0);

    const ratingScore = rating / 5;
    // Use logarithmic scaling to prevent extreme values dominating
    const savedScore = Math.log1p(saved);
    const weight = 0.6 * ratingScore + 0.4 * savedScore;
    return Math.max(0.1, weight);

}

// Normalise tags to a single match pool
function extractLocationTags(location){
    const type = String(location?.type || "").toLowerCase();
    const tags = String(location?.tags || "").toLowerCase().split(",").map(tag => tag.trim().toLowerCase())
    .filter(Boolean);

    return new Set([type, ...tags]);
}

// Check if location matches any of the user interests based on tags
function matchesInterests(location,interests){
    if(!Array.isArray(interests) || interests.length === 0){
        return true;
    }
    const tagSet = extractLocationTags(location);
    return interests.some((label) => {
        const wanted = INTEREST_TAGS[label] || [];
        return wanted.some(tag => tagSet.has(tag));
    });
}

function getInterestBoost(location, interests){
    if (!Array.isArray(interests) || interests.length === 0) return 1;
    const tagSet = extractLocationTags(location);
    const matches = interests.some((label) => {
        const wanted = INTEREST_TAGS[label] || [];
        return wanted.some(tag => tagSet.has(tag));
    });
    return matches ? 1.5 : 1;
}

// Check if location is a hotel based on type
function isHotel(location){
    return String(location?.type || "").toLowerCase() === "hotel";
}

function generateItinerary(input, allLocations){
    const { city, days, stopsPerDay, seed } = input;
    const warnings = [];
    let effectiveStopsPerDay = stopsPerDay;

    if (!Array.isArray(allLocations) || allLocations.length === 0){
        return {
            meta: {city, days, stopsPerDay, seed},
            days: [],
            warnings:["No Locations available for the selected city"]
        };
    }



    let candidates = allLocations.slice();
    candidates = candidates.filter(loc => !isHotel(loc));
    
    const weights = candidates.map((loc) => getPopularityWeight(loc) * getInterestBoost(loc, input.interests));


    // Decide how many stops we need
    const totalStops = days * effectiveStopsPerDay;
    const rand = createSeededRandom(seed ?? Date.now());
    const selectedLocations = weightedSampleWithoutReplacement(candidates, weights, totalStops, rand);
    if (candidates.length < totalStops) {
        effectiveStopsPerDay = Math.ceil(candidates.length / days);
        warnings.push(`Only found ${candidates.length} locations matching your criteria. Adjusted stops per day to ${effectiveStopsPerDay}.`);
        
    }


    // Group them into days NO heuristic yet
    const itineraryDays = [];
    let currentIndex = 0;

    for(let dayNumber = 1; dayNumber <= days; dayNumber++){
        const stopsForDay = [];

        for(let i = 0; i< effectiveStopsPerDay; i++){
            if (currentIndex >= selectedLocations.length) break;

            const location = selectedLocations[currentIndex];
            currentIndex++;

            stopsForDay.push({
                id: location.id,
                name: location.name,
                type: location.type,
                lat: location.lat,
                lon: location.lon,
                avgRating: location.avg_rating,
                imageUrl: location.image_url,
            });
        }
        itineraryDays.push({
            day:dayNumber,
            stops:stopsForDay
        });
}
    // return final itinerary object
    return {
        meta:{
            city,
            days,
            stopsPerDay: effectiveStopsPerDay,
            totalStops: selectedLocations.length,
            seed,
            generatedAt: new Date().toISOString(),
            method:{
                selection:"seeded_shuffle_no_preferences",
                ordering:"none_yet"
            }
        },
        days: itineraryDays,
        warnings
    };
}


module.exports = { generateItinerary }