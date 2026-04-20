import { useMemo, useEffect, useRef, useState } from "react";
import WarningBanner from "../WarningBanner";
import { DeleteIcon } from "../icons";

export default function AddLocationModal({
    isOpen,
    dayNumber,
    title,
    suggestedLocations,
    suggestedLoading,
    locations,
    savedLocations,
    savedLoading,
    savedError,
    isLoggedIn,
    loading,
    error,
    onClearError,
    query,
    onQueryChange,
    dayStops,
    onAddLocation,
    onRemoveLocation,
    onClose,
}) {
    const [activeTab, setActiveTab] = useState("browse");

    const addedIds = useMemo(() => {
        if (!Array.isArray(dayStops)) return new Set();
        return new Set(dayStops.map((stop) => stop?.id));
    }, [dayStops]);

    const suggestedFiltered = useMemo(() => {
        if (!Array.isArray(suggestedLocations)) return [];
        const term = String(query || "").trim().toLowerCase();
        if (!term) return suggestedLocations;
        return suggestedLocations.filter((loc) => {
            const name = String(loc?.name || "").toLowerCase();
            const city = String(loc?.city || "").toLowerCase();
            return name.includes(term) || city.includes(term);
        });
    }, [suggestedLocations, query]);

    const savedFiltered = useMemo(() => {
        if (!Array.isArray(savedLocations)) return [];
        const term = String(query || "").trim().toLowerCase();
        if (!term) return savedLocations;
        return savedLocations.filter((loc) => {
            const name = String(loc?.name || "").toLowerCase();
            const city = String(loc?.city || "").toLowerCase();
            return name.includes(term) || city.includes(term);
        });
    }, [savedLocations, query]);

    const modalRef = useRef(null);
    const previouslyFocusedElement = useRef(null);

    useEffect(() => {
        if (isOpen) {
            previouslyFocusedElement.current = document.activeElement;
            modalRef.current?.focus();
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
            previouslyFocusedElement.current?.focus();
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    useEffect(() => {
        function handleKey(e) {
            if (e.key === "Escape") onClose();
        }
        if (isOpen) {
            document.addEventListener("keydown", handleKey);
        }
        return () => {
            document.removeEventListener("keydown", handleKey);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const renderLocationList = (list, keyPrefix = "loc") => (
        <div className="tt-add-loc-list">
            {list.map((loc) => {
                const isAdded = addedIds.has(loc?.id);
                return (
                    <div className="tt-add-loc-item" key={`${keyPrefix}-${loc.id}`}>
                        <div className="tt-add-loc-info">
                            <div className="tt-add-loc-title">{loc.name}</div>
                            <div className="tt-add-loc-meta">
                                {loc.city || "Unknown city"}
                                {loc.type ? ` - ${loc.type}` : ""}
                            </div>
                        </div>
                        {isAdded ? (
                            <button
                                type="button"
                                className="tt-mini-btn tt-mini-btn-icon tt-mini-btn-danger"
                                onClick={() => onRemoveLocation?.(loc)}
                                aria-label={`Remove ${loc.name}`}
                                title="Remove from day"
                            >
                                <DeleteIcon className="tt-mini-icon" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="tt-mini-btn"
                                onClick={() => onAddLocation?.(loc)}
                            >
                                Add
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );

    return (
        <div
            className="tt-trip-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div className="tt-trip-overlay-panel" onClick={(e) => e.stopPropagation()}>
                <div className="tt-trip-details-card tt-trip-overlay-card" ref={modalRef} tabIndex={-1}>
                    <div className="tt-modal-header">
                        <div className="tt-modal-header-left">
                            <h3 id="modal-title" className="tt-modal-title mb-0">
                                {title || (dayNumber ? `Add Location to Day ${dayNumber}` : "Add Location")}
                            </h3>
                        </div>
                        <button
                            type="button"
                            className="tt-close-btn"
                            onClick={onClose}
                            aria-label="Close add location"
                        >
                            Close
                        </button>
                    </div>

                    <div className="tt-modal-body">
                        <div className="tt-add-loc-controls">
                            <label className="tt-form-label" htmlFor="tt-add-location-search">
                                Search locations
                            </label>
                            <input
                                id="tt-add-location-search"
                                className="tt-form-input tt-add-loc-input"
                                type="text"
                                placeholder="Search by name or city..."
                                value={query}
                                onChange={(e) => onQueryChange?.(e.target.value)}
                            />
                        </div>

                        <div className="tt-add-loc-tabs" role="tablist" aria-label="Location source">
                            <button
                                type="button"
                                className={`tt-add-loc-tab ${activeTab === "browse" ? "is-active" : ""}`}
                                role="tab"
                                aria-selected={activeTab === "browse"}
                                onClick={() => setActiveTab("browse")}
                            >
                                Browse All
                            </button>
                            <button
                                type="button"
                                className={`tt-add-loc-tab ${activeTab === "saved" ? "is-active" : ""}`}
                                role="tab"
                                aria-selected={activeTab === "saved"}
                                onClick={() => setActiveTab("saved")}
                            >
                                Saved
                            </button>
                        </div>

                        {activeTab === "browse" && loading && (
                            <p className="tt-empty-note text-muted mb-3">
                                <span className="tt-teabag-icon" aria-hidden="true"></span>
                                Loading locations...
                            </p>
                        )}

                        {activeTab === "browse" && !loading && suggestedFiltered.length > 0 && (
                            <div className="tt-add-loc-suggest">
                                <div className="tt-add-loc-suggest-title">Suggested for you</div>
                                {renderLocationList(suggestedFiltered, "suggest")}
                            </div>
                        )}

                        {activeTab === "browse" && suggestedLoading && (
                            <p className="tt-empty-note text-muted mb-3">
                                <span className="tt-teabag-icon" aria-hidden="true"></span>
                                Brewing suggestions...
                            </p>
                        )}

                        {error && (
                            <WarningBanner
                                message={error}
                                onClose={() => onClearError?.()}
                                variant="warning"
                            />
                        )}

                        {activeTab === "browse" && !loading && Array.isArray(locations) && locations.length === 0 && (
                            <WarningBanner
                                message="No locations match your search. Try a different name or city."
                                variant="warning"
                            />
                        )}

                        {activeTab === "browse" && !loading && Array.isArray(locations) && locations.length > 0 && (
                            renderLocationList(locations)
                        )}

                        {activeTab === "saved" && isLoggedIn === false && (
                            <WarningBanner
                                message="Log in to browse your saved locations."
                                variant="warning"
                            />
                        )}

                        {activeTab === "saved" && isLoggedIn !== false && savedLoading && (
                            <p className="tt-empty-note text-muted mb-3">
                                <span className="tt-teabag-icon" aria-hidden="true"></span>
                                Loading saved locations...
                            </p>
                        )}

                        {activeTab === "saved" && savedError && (
                            <WarningBanner
                                message={savedError}
                                variant="warning"
                            />
                        )}

                        {activeTab === "saved" && !savedLoading && !savedError && savedFiltered.length === 0 && (
                            <WarningBanner
                                message="No saved locations found for this search."
                                variant="warning"
                            />
                        )}

                        {activeTab === "saved" && !savedLoading && !savedError && savedFiltered.length > 0 && (
                            renderLocationList(savedFiltered, "saved")
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
