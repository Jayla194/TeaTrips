import { useState } from "react";
import TripDestinationCard from "./TripDestinationCard";
import { getDayColour } from "../../utils/dayColours";

export default function TripDay({
  day,
  readOnly = false,
  onRemoveStop,
  onMoveStop,
  onOpenStop,
  onAddStop,
  onRemoveDay,
}) {
  const [collapsed, setCollapsed] = useState(false);
  if (!day) return null;

  const stops = Array.isArray(day.stops) ? day.stops : [];
  const canRemoveDay = day.day !== 1; // Cannot remove day 1

  return (
    <div
      className="tt-day-card"
      style={{ borderLeft: `6px solid ${getDayColour(day.day)}` }}
    >
      <div className="tt-day-header">
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
        {!readOnly && canRemoveDay && (
          <button
            className="tt-day-delete-btn"
            type="button"
            onClick={() => onRemoveDay?.(day.day)}
            aria-label={`Delete day ${day.day}`}
            title={`Delete day ${day.day}`}
          >
            ×
          </button>
        )}
      </div>
            {!collapsed && (
                <div className="tt-day-body">
                    {/* Inline add button keeps manual flow lightweight */}
                    {!readOnly && (
                        <div className="tt-day-actions">
                            <button
                                type="button"
                                className="tt-mini-btn"
                                onClick={() => onAddStop?.(day.day)}
                            >
                                + Add location
                            </button>
                        </div>
                    )}
          {stops.length === 0 ? (
            <p className="mb-0 text-muted">No locations yet.</p>
          ) : (
            stops.map((stop, index) => (
              <TripDestinationCard
                key={stop.id ?? `${day.day}-${index}`}
                stop={stop}
                index={index}
                totalStops={stops.length}
                readOnly={readOnly}
                onMoveUp={() => onMoveStop?.(day.day, index, index - 1)}
                onMoveDown={() => onMoveStop?.(day.day, index, index + 1)}
                onRemove={() => onRemoveStop?.(day.day, index)}
                onOpen={() => onOpenStop?.(stop)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
