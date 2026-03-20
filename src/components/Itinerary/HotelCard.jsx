import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

function rating(avg) {
    if (typeof avg !== "number") return null;
    const n = Math.max(0, Math.min(5, Math.round(avg)));
    return "*".repeat(n) + "-".repeat(5 - n);
}

const fallback =
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=60";

export default function HotelCard({ hotel, onViewDetails, onRemove }) {
    const ratingVal = useMemo(() => rating(hotel?.avg_rating), [hotel?.avg_rating]);
    const navigate = useNavigate();

    return (
        <div className="mb-4">
            <h4 className="tt-section-label">Suggested Hotel</h4>
            <div className="tt-hotel-card">
                {!hotel ? (
                    <p className="mb-0 text-muted">No hotel suggestion available for this city yet.</p>
                ) : (
                    <div className="d-flex gap-3">
                        <img
                            src={hotel.image_url || fallback}
                            alt={hotel.name || "Suggested hotel"}
                            className="tt-hotel-img"
                        />

                        <div className="flex-grow-1">
                            <h3 className="tt-hotel-name">{hotel.name || "Suggested Hotel"}</h3>

                            <div className="tt-hotel-meta">
                                <span className="tt-hotel-location">
                                    {hotel.address || "Address unavailable"} | {hotel.city || "City unavailable"}
                                </span>
                                {ratingVal && <span className="tt-stars">{ratingVal}</span>}
                            </div>

                            <div className="tt-hotel-actions">
                                <button className="tt-btn tt-btn-primary" onClick={() => onViewDetails?.(hotel)}>
                                    View Details
                                </button>
                                <button className="tt-btn tt-btn-secondary" onClick={() => onRemove?.(hotel)}>
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
