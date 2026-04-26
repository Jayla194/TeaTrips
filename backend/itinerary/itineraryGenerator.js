// Same mapping from category mapping to stay consistent with frontend
const INTEREST_TAGS = {
    "Cultural": ["museum", "gallery", "art"],
    "Historical": ["history", "castle"],
    "Food & Cafes": ["restaurant", "food", "cafe", "market", "pub"],
    "Attractions": ["attraction", "museum", "history", "castle", "gallery", "zoo", "theme park", "art"],
    "Entertainment": ["theatre", "music venue", "sport venue", "entertainment"],
    "Nature": ["nature", "park"],
};

function weightedSampleWithoutReplacement(items, weights, sampleSize, rand){
    const selected = [];
    const itemsCopy = items.slice();
    const weightsCopy = weights.slice();
    
    // If weights are all zero then use uniform sampling
    for (let k = 0; k < sampleSize && itemsCopy.length > 0; k++){
        const totalWeight = weightsCopy.reduce((sum, w) => sum + w, 0);
        if (totalWeight <= 0) {
            // uniform random
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

// Check if location is a hotel based on type
function isHotel(location){
    return String(location?.type || "").toLowerCase() === "hotel";
}

function generateItinerary(input, allLocations){
    const { city, days, stopsPerDay, interests, savedLocationIds = [] } = input;
    const warnings = [];

    if (!Array.isArray(allLocations) || allLocations.length === 0){
        return {
            meta: { city, days, stopsPerDay },
            days: [],
            warnings:["No locations available for the selected city"]
        };
    }

    const rand = Math.random;
    const totalStops = days * stopsPerDay;

    // Remove hotels from candidates
    const candidates = allLocations.filter((loc) => !isHotel(loc));
    const hasInterests = Array.isArray(interests) && interests.length > 0;

    // Split into matched and unmatched pools
    const matched = hasInterests
        ? candidates.filter((loc) => matchesInterests(loc, interests))
        : candidates;
    const unmatched = hasInterests
        ? candidates.filter((loc) => !matchesInterests(loc, interests))
        : [];

    // Boost saved locations within each pool by increasing their popularity weight
    const getWeight = (loc) => {
        const base = getPopularityWeight(loc);
        const savedBoost = savedLocationIds.includes(loc.id) ? 1.5 : 1;
        return base * savedBoost;
    };

    let selectedLocations = [];
    if (!hasInterests || matched.length === 0) {
        // No interests selected
        const weights = candidates.map(getWeight);
        selectedLocations = weightedSampleWithoutReplacement(candidates, weights, totalStops, rand);
    } else {
        // Guarantee at least 60% of stops come from interest-matched locations
        const guaranteedCount = Math.min(
            Math.floor(totalStops * 0.6),
            matched.length
        );
        const remainingCount = Math.min(
            totalStops - guaranteedCount,
            unmatched.length
        );

        const matchedWeights = matched.map(getWeight);
        const unmatchedWeights = unmatched.map(getWeight);

        const selectedMatched = weightedSampleWithoutReplacement(matched, matchedWeights, guaranteedCount, rand);
        const selectedOther = weightedSampleWithoutReplacement(unmatched, unmatchedWeights, remainingCount, rand);
        selectedLocations = [...selectedMatched, ...selectedOther];

        if (selectedLocations.length < totalStops) {
            warnings.push(`Only found ${selectedLocations.length} locations matching your criteria.`);
        }
    }

    // Distribute evenly across days
    const effectiveStopsPerDay = Math.ceil(selectedLocations.length / days);


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
            generatedAt: new Date().toISOString(),
        },
        days: itineraryDays,
        warnings
    };
}


module.exports = { generateItinerary }
