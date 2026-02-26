export function getSimilarLocations(currentLocation, allLocations, limit = 5){
    
    // Loop through all locations and score them against the selected location's attributes
    
    return allLocations.filter(location => location.id !== currentLocation.id)
    .map(location => {
        let score = 0;

        if (location.type === currentLocation.type) score += 3;
        if(location.city === currentLocation.city) score += 2;
        if (Math.abs(location.price_tier - currentLocation.price_tier) <=1 ) scpre += 1;
        return {... location, score};
    })
    .sort((a,b)=>b.score-a.score)
    .slice(0,limit);
}

// For each location in allLocations
// IF location.id === currentLocation.id
// skip
// score = 0
// IF same category then score + 3
// IF same city then score -> 2
// If price difference < 1 then score + 1
// store location + score
// SORT by score descending
// Return top 5