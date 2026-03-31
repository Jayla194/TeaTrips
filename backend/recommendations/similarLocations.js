

// Build feature space
function buildFeatureSpace(allLocations){
    const types = new Set();
    const cities = new Set();
    const tags = new Set();

    for (const location of allLocations){
        if (location.type) types.add(normalizeString(location.type));
        if (location.city) cities.add(normalizeString(location.city));
        for (const t of splitTags(location.tags)) tags.add(t);
    }

    return {
        types: Array.from(types).sort(),
        cities: Array.from(cities).sort(),
        tags: Array.from(tags).sort()
    }
}

// Vectorize locations
function vectorizeLocation(location, featureSpace){
    const typeVector = oneHot(location.type, featureSpace.types);
    const cityVector = oneHot(location.city, featureSpace.cities);
    const tagVector = multiHot(splitTags(location.tags), featureSpace.tags);

    const priceTier = clampNumber(location.price_tier);
    const avgRating = clampNumber(location.avg_rating);
    const priceNorm = Math.min(4, Math.max(0, priceTier)) / 4;
    const ratingNorm = Math.min(5, Math.max(0, avgRating)) / 5;

    return [...typeVector, ...cityVector, ...tagVector, priceNorm, ratingNorm];
}


// Cosine similarity
function cosineSimilarity(a, b){
    let dot = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < a.length; i++){
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }

    if (magA === 0 || magB === 0) return 0;
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// Helper functions
// Normalize string for consistent comparison
function normalizeString(value){
    return String(value || "").trim().toLowerCase();
}

// Split tags string into array
function splitTags(tags){
    if (!tags) return [];
    return String(tags).split(';').map((t)=> normalizeString(t)).filter(Boolean);
}

// One-hot encoding for type and city
function oneHot(value, categories){
    const array = new Array(categories.length).fill(0);
    if (!value) return array;
    const index = categories.indexOf(normalizeString(value));
    if (index >= 0) array[index] = 1;
    return array;
}

// Multi-hot encoding for tags
function multiHot(values, categories){
    const set = new Set(values.map(normalizeString));
    return categories.map((cat) => set.has(cat) ? 1 : 0);
}

// Clamp number to valid range
function clampNumber(value){
    const val = Number(value);
    return Number.isFinite(val) ? val : 0;
}

// Main function to get similar locations
function similarLocations(currentLocation, allLocations, limit = 5){
    if (!currentLocation || !Array.isArray(allLocations)) return [];

    const featureSpace = buildFeatureSpace(allLocations);
    const currentVector = vectorizeLocation(currentLocation, featureSpace);

    return allLocations
        .filter((location) => location.id !== currentLocation.id)
        .map((location) => {
            const vector = vectorizeLocation(location, featureSpace);
            const similarity = cosineSimilarity(currentVector, vector);
            return { ...location, similarity };
        })
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
}

module.exports = {
    similarLocations
};