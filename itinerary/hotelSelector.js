const { getHotelsByCity } = require("../models/locationModel");

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



async function selectHotel({ city, itinerary, seed }) {
    const hotels = await getHotelsByCity(city);
    if (!hotels.length) return null;

    const random = createSeededRandom(seed ?? itinerary?.meta?.seed ?? Date.now());
    const index = Math.floor(random() * hotels.length);
    return hotels[index];
}


module.exports = { selectHotel };