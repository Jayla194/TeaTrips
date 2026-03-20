const CATEGORY_TYPES = {
    attractions: ["attraction", "museum", "history", "castle", "gallery", "zoo", "theme park", "art"],
    food_drink: ["restaurant", "food", "cafe", "pub", "market"],
    entertainment: ["theatre", "music venue", "sport venue", "entertainment"],
    nature_outdoors: ["nature", "park"],
    accommodation: ["hotel", "spa"],

  // itinerary-specific groupings (can overlap)
    cultural: ["museum", "gallery", "art"],
    historical: ["history", "castle"],
    food_cafes: ["restaurant", "food", "cafe", "market", "pub"],
    nature: ["nature", "park"],
};

const LABEL_TO_KEY = {
  // Explore pills
    "Attractions": "attractions",
    "Food & Drink": "food_drink",
    "Entertainment": "entertainment",
    "Nature & Outdoors": "nature_outdoors",
    "Accommodation": "accommodation",

  // Itinerary interests
    "Cultural": "cultural",
    "Historical": "historical",
    "Food & Cafes": "food_cafes",
    "Nature": "nature",
};

export function pillMatches(type, pillLabel) {
    const t = String(type || "").toLowerCase();
    const key = LABEL_TO_KEY[pillLabel];
    if (!key) return true;
    return CATEGORY_TYPES[key]?.includes(t) ?? false;
}

export const itineraryPreferences = {
    maxSelectableInterests: 3,
    interests: [
        "Cultural",
        "Historical",
        "Food & Cafes",
        "Attractions",
        "Entertainment",
        "Nature",
    ],
};