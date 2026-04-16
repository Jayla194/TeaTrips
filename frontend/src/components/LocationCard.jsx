import { useMemo } from "react";

function rating(avg) {
    const num = Number(avg);
    if (!Number.isFinite(num)) return null;
    const n = Math.max(0, Math.min(5, Math.round(num)));
    return "\u2605".repeat(n) + "\u2606".repeat(5 - n);
}

export default function LocationCard({ location, onClick, variant = "default", onAdminEdit }) {
    const isAdminCard = variant === "admin";
    const avgRatingNum = useMemo(() => {
        const num = Number(location?.avg_rating);
        return Number.isFinite(num) ? num : null;
    }, [location?.avg_rating]);
    const rating_val = useMemo(() => (avgRatingNum === null ? null : rating(avgRatingNum)), [avgRatingNum]);
    const reviewCount =
        typeof location?.review_count === "number"
            ? location.review_count
            : typeof location?.reviews_count === "number"
            ? location.reviews_count
            : typeof location?.reviewCount === "number"
            ? location.reviewCount
            : null;

    const fallback =
        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=60";

    if (isAdminCard) {
        return (
            <div className="tt-loc-card tt-admin-compact-card h-100">
                <div className="tt-loc-imgwrap">
                    <img
                        className="tt-loc-img"
                        src={location.image_url || fallback}
                        alt={location.name || "Location image"}
                        loading="lazy"
                        onError={(event) => {
                            event.currentTarget.src = fallback;
                        }}
                    />
                </div>

                <div className="tt-loc-body">
                    <h5 className="tt-loc-title">{location.name}</h5>

                    <div className="tt-loc-info">
                        <span>{location.city || "Unknown city"}</span>
                        <span className="tt-dot">•</span>
                        <span>{location.type || "Unknown type"}</span>
                    </div>

                    <div className="tt-loc-bottom">
                        <div className="tt-loc-rating">
                            {rating_val && <span className="tt-stars">{rating_val}</span>}
                            <span>{avgRatingNum === null ? "N/A" : avgRatingNum.toFixed(1)}</span>
                        </div>
                        <button
                            type="button"
                            className="tt-btn tt-admin-location-edit-btn"
                            title="Edit location (coming soon)"
                            onClick={(event) => {
                                event.stopPropagation();
                                if (onAdminEdit) onAdminEdit();
                            }}
                        >
                            Edit
                        </button>
                    </div>

                    <div className="tt-admin-location-stats">
                        <span><strong>{location.saved_count ?? 0}</strong> saves</span>
                        <span><strong>{location.review_count ?? 0}</strong> reviews</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="tt-loc-card h-100"
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onClick={onClick}
            onKeyDown={(e) => {
                if (!onClick) return;
                if (e.key === "Enter" || e.key === " ") onClick();
            }}
        >
            <div className="tt-loc-imgwrap">
                <img
                    className="tt-loc-img"
                    src={location.image_url || fallback}
                    alt={location.name || "Location image"}
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.src = fallback;
                    }}
                />
            </div>
            <div className="tt-loc-body">
                <h5 className="tt-loc-title">{location.name}</h5>

                <div className="tt-loc-info">
                    <span>{location.city}</span>
                </div>
                <div className="tt-loc-bottom">
                    <div className="tt-loc-rating">
                        {rating_val && <span className="tt-stars">{rating_val}</span>}
                        {avgRatingNum !== null && (
                            <span className="tt-avg-rating">
                                {avgRatingNum.toFixed(1)}
                            </span>
                        )}
                        {reviewCount !== null && (
                            <span className="tt-reviews-count">{reviewCount}</span>
                        )}
                    </div>
                    {typeof location.price_tier === "number" && location.price_tier > 0 ? (
                        <span className="tt-price">
                            {"\u00a3".repeat(Math.min(location.price_tier, 4))}
                        </span>
                    ) : (
                        <span />
                    )}
                </div>
            </div>
        </div>
    );
}
