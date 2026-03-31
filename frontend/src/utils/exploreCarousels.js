import { pillMatches } from "./categoryMapping";

// First Tester Carousel

// Finds attractions in London and sorts them by most saved
export function getLondonAttractionsMostSaved(locations){
    return locations
    .filter((l) => String(l.city || "").toLowerCase() === "london")
    .filter((l) => pillMatches(l.type,"Attractions"))
    .slice()
    .sort((a,b) => (b.saved_count || 0) - (a.saved_count || 0));
}

// Most Rated and Cheap
export function getHighlyRatedCheapLocations(locations){
    return locations
    .filter((l) => l.avg_rating >= 4)
    .filter((l) => l.price_tier <= 2)
    .sort((a,b) => (b.saved_count || 0) - (a.saved_count || 0))
    .slice(0, 10);
}

