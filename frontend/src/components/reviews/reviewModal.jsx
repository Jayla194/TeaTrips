import { useState, useEffect } from "react";

function StarRating({ value, onChange }) {
    const percentage = `${Math.max(0, Math.min(100, (value / 5) * 100))}%`;

    function pickValue(clientX, rect) {
        const x = Math.min(Math.max(0, clientX - rect.left), rect.width);
        const raw = (x / rect.width) * 5;
        const rounded = Math.round(raw * 2) / 2;
        return Math.max(0.5, Math.min(5, rounded));
    }

    function handleClick(e) {
        const base = e.currentTarget.querySelector(".tt-stars-base");
        const rect = (base || e.currentTarget).getBoundingClientRect();
        onChange(pickValue(e.clientX, rect));
    }

    function handleKeyDown(e) {
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            onChange(Math.max(0.5, Math.round((value - 0.5) * 2) / 2));
        }
        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            onChange(Math.min(5, Math.round((value + 0.5) * 2) / 2));
        }
    }

    return (
        <div
            className="tt-stars-input"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role="slider"
            tabIndex={0}
            aria-label="Rating"
            aria-valuemin={0.5}
            aria-valuemax={5}
            aria-valuenow={value}
        >
            <div className="tt-stars-wrap">
                <div className="tt-stars-base">{"\u2605\u2605\u2605\u2605\u2605"}</div>
                <div className="tt-stars-fill" style={{ width: percentage }}>
                    {"\u2605\u2605\u2605\u2605\u2605"}
                </div>
            </div>
        </div>
    );
}

export default function ReviewModal({
    isOpen,
    // Create or Edit
    mode,
    initialReview,
    onSubmit,
    onClose,
    locationName,
}) {
    const [rating, setRating] = useState(0.5);
    const [comment, setComment] = useState("");

    useEffect(() => {
        if (mode == "edit" && initialReview) {
            setRating(initialReview.rating || 0.5);
            setComment(initialReview.comment || "");
        } else {
            setRating(0.5);
            setComment("");
        }
    }, [mode, initialReview, isOpen]);

    if (!isOpen) return null;

    const heading = mode === "edit" ? "Edit Your Review" : `Share your visit${locationName ? ` at ${locationName}` : ""}`;
    const subheading = mode === "edit"
        ? "Update your rating or tweak your comments."
        : "Help others by sharing what you loved (or did not).";

    function handleSubmit(e) {
        e.preventDefault();
        onSubmit({ rating, comment });
    }

    return (
        <div className="tt-modal-backdrop">
            <div className="tt-modal">
                <div className="tt-modal-header">
                    <div className="tt-modal-header-left">
                        <h2 className="tt-modal-title">{heading}</h2>
                        <p className="tt-modal-subtitle">{subheading}</p>
                    </div>
                    <button className="tt-btn tt-btn-ghost" onClick={onClose} aria-label="Close">
                        x
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="tt-modal-body">
                    <label className="tt-field">
                        <span className="tt-field-label">Rating</span>
                        <div className="tt-star-row">
                            <StarRating value={rating} onChange={setRating} />
                            <span className="tt-star-value">{rating.toFixed(1)}</span>
                        </div>
                        <span className="tt-field-hint">Click to choose half stars</span>
                    </label>
                    <label className="tt-field">
                        <span className="tt-field-label">Your review (optional)</span>
                        <textarea
                            className="tt-field-textarea"
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="What stood out? Service, atmosphere, tea selection, value..."
                            rows={5}
                        />
                    </label>
                    <div className="tt-modal-footer">
                        <button type="button" className="tt-btn tt-btn-ghost" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="tt-btn tt-btn-primary">
                            {mode === "edit" ? "Update Review" : "Submit Review"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
