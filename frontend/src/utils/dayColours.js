const dayColours = ["#2F6F4E", "#9C6B3E", "#5E7A9A", "#7A4E8A", "#C06C2B", "#3E8C8C"];

export function getDayColour(day) {
    if (!Number.isFinite(day)) return "#2F6F4E";
    return dayColours[(day - 1) % dayColours.length];
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function hexToRgb(hex) {
    const normalized = String(hex || "").replace("#", "");
    if (normalized.length !== 6) return { r: 47, g: 111, b: 78 };

    const r = Number.parseInt(normalized.slice(0, 2), 16);
    const g = Number.parseInt(normalized.slice(2, 4), 16);
    const b = Number.parseInt(normalized.slice(4, 6), 16);

    if (![r, g, b].every(Number.isFinite)) return { r: 47, g: 111, b: 78 };
    return { r, g, b };
}

export function getDayStopColour(day, stopIndex, totalStops) {
    const base = hexToRgb(getDayColour(day));
    const denominator = Math.max(1, Number(totalStops) - 1);
    const ratio = clamp(Number(stopIndex) / denominator, 0, 1);

    // Early stops are brighter; later stops become closer to base tone.
    const lift = Math.round(48 * (1 - ratio));
    const r = clamp(base.r + lift, 0, 255);
    const g = clamp(base.g + lift, 0, 255);
    const b = clamp(base.b + lift, 0, 255);

    return `rgb(${r}, ${g}, ${b})`;
}
