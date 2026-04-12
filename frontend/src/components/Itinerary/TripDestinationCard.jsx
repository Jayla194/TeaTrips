import { useMemo } from "react";
import { DeleteIcon } from "../icons";

function rating(avg){
    if (typeof avg !== "number") return null;
    const n = Math.max(0, Math.min(5, Math.round(avg)));
    return "*".repeat(n) + "-".repeat(5 - n);
}

const fallback = "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=60";

export default function TripDestinationCard({
    stop,
    index,
    totalStops,
    readOnly = false,
    onMoveUp,
    onMoveDown,
    onRemove,
    onOpen,
}) {
    const ratingValue = useMemo(() => rating(stop?.avgRating), [stop?.avgRating]);
    if (!stop) return null;

    return(
        <div
            className="tt-destination-card"
            onClick={() => onOpen?.(stop)}
            style={{ cursor: onOpen ? "pointer" : "default" }}
        >
            <img
                src={stop.imageUrl || fallback}
                alt = {stop.name || "Location"}
                className="tt-destination-img"
                onError={(e)=> {
                    e.currentTarget.src = fallback;
                }}
            />
            
            <div className="tt-destination-content">
                <div className="tt-destination-header">
                    <div className="tt-destination-title-wrap">
                        <h4 className="tt-destination-name mb-1">{stop.name || "Location"}</h4>
                        <div className="tt-destination-meta">
                            {stop.type && <span className="tt-destination-type">{stop.type}</span>}
                            {ratingValue && <span className="tt-stars">{ratingValue}</span>}
                        </div>
                    </div>

                    {!readOnly && (
                        <div className="tt-destination-actions">
                            <button
                                className="tt-mini-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMoveUp?.();
                                }}
                                disabled={index === 0}
                                aria-label="Move up"
                            >
                                ^
                            </button>
                            <button
                                className="tt-mini-btn tt-mini-btn-icon tt-mini-btn-danger"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove?.();
                                }}
                                aria-label="Remove location"
                                title="Remove"
                            >
                                <DeleteIcon className="tt-mini-icon" />
                            </button>
                            <button
                                className="tt-mini-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMoveDown?.();
                                }}
                                disabled={index === totalStops - 1}
                                aria-label="Move down"
                            >
                                v
                            </button>
                        </div>
                    )}

                </div>
            </div>




        </div>
    )
    
    }
