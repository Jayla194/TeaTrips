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


function generateItinerary(input, allLocations){
    const { city, days, stopsPerDay, seed } = input;
    const warnings = [];

    if (!Array.isArray(allLocations) || allLocations.length === 0){
        return {
            meta: {city, days, stopsPerDay, seed},
            days: [],
            warnings:["No Locations available for the selected city"]
        };
    }


const shuffledLocations = shuffleWithSeed(allLocations, seed);

// Decide how many stops we need
const totalStops = days * stopsPerDay;

if (shuffledLocations.length < totalStops){
    //change the stops per day to something more manageable with available data
}
// Pick that many stops from the shuffled list

const selectedLocations = shuffledLocations.slice(0,totalStops);

// Group them into days NO heuristic yet
const itineraryDays = [];
let currentIndex = 0;

for(let dayNumber = 1; dayNumber <= days; dayNumber++){
    const stopsForDay = [];

    for(let i = 0; i< stopsPerDay; i++){
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
            stopsPerDay,
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