import { useMemo } from "react";

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
    onMoveUp,
    onMoveDown,
    onRemove,
    onOpen,
}) {
    const ratingValue = useMemo(() => rating(stop?.avgRating), [stop?.avgRating]);
    if (!stop) return null;

    return(
        <div className="tt-destination-card" onClick={() => onOpen?.(stop)} style={{ cursor: onOpen ? "pointer" : "default" }}>
            <img
                src={stop.imageUrl || fallback}
                alt = {stop.name || "Location"}
                className="tt-destination-img"
                onError={(e)=> {
                    e.currentTarget.src = fallback;
                }}
            />
            
            <div className="tt-destination-content">
                <div className="d-flex justify-content-between align-items-start gap-2">
                    <div>
                        <h4 className="tt-destination-name mb-1">{stop.name || "Location"}</h4>
                        <div className="tt-destination-meta">
                            {stop.type && <span className="tt-destination-type">{stop.type}</span>}
                            {ratingValue && <span className="tt-stars">{ratingValue}</span>}
                        </div>
                    </div>

                    <div className="tt-destination-actions">
                        <button className="tt-mini-btn" onClick={onMoveUp} disabled={index === 0}>
                            ^
                        </button>
                        <button className="tt-mini-btn tt-mini-btn-danger" onClick={onRemove}>
                            X
                        </button>
                        <button className="tt-mini-btn" onClick={onMoveDown} disabled={index === totalStops - 1}>
                            v
                        </button>
                    </div>

                </div>
            </div>




        </div>
    )
    
    }
