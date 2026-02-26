export function pillMatches(type,pill){
    const t = String(type || "").toLowerCase();

    if (pill === "Attractions")
            return ["attraction","museum","history","castle","gallery","zoo","theme park", "art"].includes(t);
        
        if (pill === "Food & Drink")
            return ["restaurant","food","cafe","pub","market"].includes(t);

        if (pill === "Entertainment")
            return ["theatre","music venue","sport venue","entertainment"].includes(t);

        if (pill === "Nature & Outdoors")
            return ["nature","park"].includes(t);

        if (pill === "Accommodation")
            return ["hotel", "spa"].includes(t);

        return true;
}