const dayColours = ["#2F6F4E", "#9C6B3E", "#5E7A9A", "#7A4E8A", "#C06C2B", "#3E8C8C"];

export function getDayColour(day) {
    if (!Number.isFinite(day)) return "#2F6F4E";
    return dayColours[(day - 1) % dayColours.length];
} 