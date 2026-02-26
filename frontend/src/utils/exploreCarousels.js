import { pillMatches } from "./categoryMapping";

// First Tester Carousel

// Finds attractions in London and sorts them alphabetically
export function getLondonAttractionsAZ(locations){
    return locations
    .filter((l) => String(l.city || "").toLowerCase() === "london")
    .filter((l) => pillMatches(l.type,"Attractions"))
    .slice()
    .sort((a,b) => String(a.name || "").localeCompare(String(b.name || "")));
}