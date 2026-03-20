import { useState } from "react";
import TripDestinationCard from "./TripDestinationCard";
import { getDayColour } from "../../utils/dayColours";

export default function TripDay({ day, onRemoveStop, onMoveStop }) {
    const [collapsed, setCollapsed] = useState(false);
    if (!day) return null;

    const stops = Array.isArray(day.stops) ? day.stops : [];

    return (
        <div className="tt-day-card" style={{ borderLeft: `6px solid ${getDayColour(day.day)}` }}>
            <button
                className="tt-day-header-btn"
                type="button"
                onClick={() => setCollapsed((prev) => !prev)}
                aria-expanded={!collapsed}
            >
                <div className="tt-day-header-left">
                    <h3 className="tt-day-title mb-0">Day {day.day}</h3>
                </div>
                <span className="tt-day-chevron">{collapsed ? "+" : "-"}</span>
            </button>
            {!collapsed && (
                <div className="tt-day-body">
                    {stops.length === 0 ? (
                        <p className="mb-0 text-muted">No locations yet.</p>
                    ):(
                        stops.map((stop,index)=> (
                            <TripDestinationCard
                                key={stop.id ?? `${day.day}-${index}`}
                                stop={stop}
                                index={index}
                                totalStops={stops.length}
                                onMoveUp={() => onMoveStop?.(day.day, index, index-1)}
                                onMoveDown={() => onMoveStop?.(day.day, index, index+1)}
                                onRemove={() => onRemoveStop?.(day.day, index)}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    )
}
