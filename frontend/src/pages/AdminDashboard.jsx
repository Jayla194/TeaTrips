import { useEffect, useState } from "react";
import { apiUrl } from "../utils/api";
import WarningBanner from "../components/WarningBanner";
import SearchBar from "../components/SearchBar";
import LocationCard from "../components/LocationCard";

// Reset shape for the Add Location form.
const emptyLocation = {
    name: "",
    type: "",
    address: "",
    city: "",
    postcode: "",
    website: "",
    phone: "",
    opening_hours: "",
    tags: "",
    image_url: "",
    description_short: "",
};

export default function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [activeSection, setActiveSection] = useState("overview");
    const [locationForm, setLocationForm] = useState(emptyLocation);
    const [locationSaving, setLocationSaving] = useState(false);
    const [locationFeedback, setLocationFeedback] = useState({ message: "", variant: "success" });
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [locationSearch, setLocationSearch] = useState("");
    const [adminLocations, setAdminLocations] = useState([]);
    const [locationsLoading, setLocationsLoading] = useState(false);
    const [editingLocationId, setEditingLocationId] = useState(null);
    const [adminReviews, setAdminReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewVisibility, setReviewVisibility] = useState("visible");
    const [adminUsers, setAdminUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);

    const [keyStats, setKeyStats] = useState({
    totalLocations: 0,
    totalUsers: 0,
    totalReviews: 0,
    avgRating: 0,
});

useEffect(() => {
    async function loadUser() {
    try {
        const res = await fetch(apiUrl("/api/auth/user"), {
        credentials: "include",
        });

        if (!res.ok) {
        setUser(null);
        return;
        }

        const data = await res.json();
        setUser(data.user || null);
    } catch {
        setUser(null);
    } finally {
        setLoadingUser(false);
    }
    }

    loadUser();
}, []);

    // When the modal is open, lock page scroll and allow Escape-to-close.
    useEffect(() => {
        if (!isLocationModalOpen) return;

        function handleEscape(event) {
            if (event.key === "Escape") {
                setIsLocationModalOpen(false);
            }
        }

        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = "";
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isLocationModalOpen]);

    useEffect(() => {
    async function loadOverview() {
        if (!user || user.role !== "admin") return;

        try {
        setLoading(true);
        const res = await fetch(apiUrl("/api/admin/summary"), {
            credentials: "include",
        });

            if (!res.ok) {
                setError("Failed to load admin summary");
                return;
            }

            const data = await res.json();
            setKeyStats(data.summary || {});
        } catch {
        setError("Failed to load admin summary");
        } finally {
        setLoading(false);
        }
    }

    loadOverview();
    }, [user]);

    useEffect(() => {
        async function loadAdminLocations() {
            if (!user || user.role !== "admin") return;

            try {
                setLocationsLoading(true);
                const res = await fetch(apiUrl("/api/admin/locations"), {
                    credentials: "include",
                });

                if (!res.ok) {
                    setError("Failed to load locations");
                    return;
                }

                const data = await res.json();
                setAdminLocations(Array.isArray(data) ? data : []);
            } catch {
                setError("Failed to load locations");
            } finally {
                setLocationsLoading(false);
            }
        }

        loadAdminLocations();
    }, [user]);

    useEffect(() => {
        async function loadAdminReviews() {
            if (!user || user.role !== "admin" || activeSection !== "reviews") return;

            try {
                setReviewsLoading(true);
                const res = await fetch(apiUrl(`/api/admin/reviews?visibility=${reviewVisibility}`), {
                    credentials: "include",
                });

                if (!res.ok) {
                    setError("Failed to load reviews");
                    return;
                }

                const data = await res.json();
                setAdminReviews(Array.isArray(data) ? data : []);
            } catch {
                setError("Failed to load reviews");
            } finally {
                setReviewsLoading(false);
            }
        }

        loadAdminReviews();
    }, [user, activeSection, reviewVisibility]);

    useEffect(() => {
        async function loadAdminUsers() {
            if (!user || user.role !== "admin" || activeSection !== "users") return;

            try {
                setUsersLoading(true);
                const res = await fetch(apiUrl("/api/admin/users"), {
                    credentials: "include",
                });

                if (!res.ok) {
                    setError("Failed to load users");
                    return;
                }

                const data = await res.json();
                setAdminUsers(Array.isArray(data) ? data : []);
            } catch {
                setError("Failed to load users");
            } finally {
                setUsersLoading(false);
            }
        }

        loadAdminUsers();
    }, [user, activeSection]);

    function handleLocationChange(event) {
        const { name, value } = event.target;
        setLocationForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    async function handleLocationSubmit(event) {
        event.preventDefault();

        setLocationSaving(true);
        setLocationFeedback({ message: "", variant: "success" });
        const isEditingLocation = Boolean(editingLocationId);

        try {
            const endpoint = isEditingLocation
                ? apiUrl(`/api/admin/locations/${editingLocationId}`)
                : apiUrl("/api/admin/locations");

            const res = await fetch(endpoint, {
                method: isEditingLocation ? "PUT" : "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(locationForm),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || data.message || "Failed to create location");
            }

            setLocationFeedback({
                message: isEditingLocation
                    ? `Updated ${data.location?.name || "location"}.`
                    : `Created ${data.location?.name || "location"} with coordinates ${data.location?.lat}, ${data.location?.lon} (${data.location?.geocodeSource || "manual"}).`,
                variant: "success",
            });
            setLocationForm(emptyLocation);
            setEditingLocationId(null);
            setIsLocationModalOpen(false);

            if (isEditingLocation) {
                setAdminLocations((current) =>
                    current.map((location) =>
                        String(location.id) === String(editingLocationId)
                            ? { ...location, ...data.location }
                            : location
                    )
                );
            } else {
                setAdminLocations((current) => [data.location, ...current]);
            }
        } catch (err) {
            setLocationFeedback({
                message: err.message || "Failed to create location",
                variant: "danger",
            });
        } finally {
            setLocationSaving(false);
        }
    }

    function handleAddLocationClick() {
        setEditingLocationId(null);
        setLocationForm(emptyLocation);
        setIsLocationModalOpen(true);
    }

    function handleEditLocationClick(location) {
        setEditingLocationId(location.id);
        setLocationForm({
            name: location.name || "",
            type: location.type || "",
            address: location.address || "",
            city: location.city || "",
            postcode: location.postcode || "",
            website: location.website || "",
            phone: location.phone || "",
            opening_hours: location.opening_hours || "",
            tags: location.tags || "",
            image_url: location.image_url || "",
            description_short: location.description_short || "",
        });
        setIsLocationModalOpen(true);
    }

if (loadingUser) {
    return (
    <div className="container py-4" style={{ minHeight: "100vh" }}>
        <p className="tt-empty-note text-muted">
        <span className="tt-teabag-icon" aria-hidden="true"></span>
        Loading admin dashboard...
        </p>
    </div>
    );
}

if (!user) {
    return (
    <div className="container py-4" style={{ minHeight: "100vh" }}>
        <div>
        Please log in to view this page.
        <br />
        <a href="/login">Log in</a>
        </div>
    </div>
    );
}

if (user.role !== "admin") {
    return (
    <div className="container py-4" style={{ minHeight: "100vh" }}>
        <WarningBanner
        message="You do not have permission to access the admin dashboard."
        onClose={() => {}}
        variant="warning"
        />
    </div>
    );
}

const initial = user?.first_name?.[0]?.toUpperCase() || "A";
const normalizedLocationSearch = locationSearch.trim().toLowerCase();
const filteredAdminLocations = adminLocations.filter((location) => {
    if (!normalizedLocationSearch) return true;
    return [
        location.name,
        location.type,
        location.city,
        location.postcode,
    ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedLocationSearch));
});

return (
    <div className="container py-4" style={{ minHeight: "100vh" }}>
    {error && (
        <WarningBanner
        message={error}
        onClose={() => setError("")}
        variant="warning"
        />
    )}

    <div className="row g-5">
        <div className="col-12 col-lg-3">
        <div className="tt-profile-card tt-profile-panel p-4">

            <div className="tt-profile-divider" />

            <div className="tt-profile-nav">
            <div className="tt-profile-nav-title">Admin Controls</div>

            <button
                type="button"
                className={`tt-profile-nav-item ${activeSection === "overview" ? "is-active" : ""}`}
                onClick={() => setActiveSection("overview")}
            >
                Overview
            </button>

            <button
                type="button"
                className={`tt-profile-nav-item ${activeSection === "locations" ? "is-active" : ""}`}
                onClick={() => setActiveSection("locations")}
            >
                Locations
            </button>

            <button
                type="button"
                className={`tt-profile-nav-item ${activeSection === "reviews" ? "is-active" : ""}`}
                onClick={() => setActiveSection("reviews")}
            >
                Reviews
            </button>

            <button
                type="button"
                className={`tt-profile-nav-item ${activeSection === "users" ? "is-active" : ""}`}
                onClick={() => setActiveSection("users")}
            >
                Users
            </button>
            </div>
            <div className="tt-profile-divider" />
        </div>
        </div>

        <div className="col-12 col-lg-9">
        <div className="tt-loc-card tt-admin-main-card p-4">
            {activeSection === "overview" && (
            <div className="tt-admin-overview">
                <h5 className="tt-admin-overview-title">Admin Overview</h5>
                <p className="tt-admin-overview-subtitle">Key stats for TeaTrips growth and activity.</p>

                {loading ? (
                <p className="mb-0">Loading overview...</p>
                ) : (
                <div className="tt-admin-stat-grid">
                    <div className="tt-admin-stat-card">
                        <div className="tt-admin-stat-label">Total locations</div>
                        <div className="tt-admin-stat-value">{keyStats.totalLocations ?? 0}</div>
                    </div>

                    <div className="tt-admin-stat-card">
                        <div className="tt-admin-stat-label">Total users</div>
                        <div className="tt-admin-stat-value">{keyStats.totalUsers ?? 0}</div>
                    </div>

                    <div className="tt-admin-stat-card">
                        <div className="tt-admin-stat-label">Total reviews</div>
                        <div className="tt-admin-stat-value">{keyStats.totalReviews ?? 0}</div>
                    </div>

                    <div className="tt-admin-stat-card tt-admin-stat-card-wide">
                        <div className="tt-admin-stat-label">New users (last 7 days)</div>
                        <div className="tt-admin-stat-value">{keyStats.newUsers7d ?? 0}</div>
                    </div>

                    <div className="tt-admin-stat-card tt-admin-stat-card-wide">
                        <div className="tt-admin-stat-label">New reviews (last 7 days)</div>
                        <div className="tt-admin-stat-value">{keyStats.newReviews7d ?? 0}</div>
                    </div>
                </div>
                )}
            </div>
            )}

            {activeSection === "locations" && (
            <div className="tt-admin-location-panel">
                <div className="tt-admin-location-toolbar">
                    <div className="tt-admin-location-toolbar-search">
                        <SearchBar
                            value={locationSearch}
                            onChange={setLocationSearch}
                            placeholder="Search admin locations by name, type, city or postcode"
                            onClear={() => setLocationSearch("")}
                            containerClassName="w-100"
                            maxWidth="100%"
                        />
                    </div>

                    <select
                        className="form-select tt-admin-filter-placeholder"
                        aria-label="Location filter options"
                        defaultValue="placeholder"
                    >
                        <option value="placeholder">Filter options (coming soon)</option>
                    </select>

                    <button type="button" className="tt-btn" onClick={handleAddLocationClick}>
                        Add location
                    </button>
                </div>

                {locationFeedback.message && (
                    <WarningBanner
                        message={locationFeedback.message}
                        onClose={() => setLocationFeedback({ message: "", variant: "success" })}
                        variant={locationFeedback.variant}
                        inline
                    />
                )}

                {locationsLoading ? (
                    <p className="mb-0 text-muted">Loading locations...</p>
                ) : (
                    <div className="tt-admin-location-grid">
                        {filteredAdminLocations.map((location) => (
                            <LocationCard
                                key={location.id}
                                location={location}
                                variant="admin"
                                onAdminEdit={() => handleEditLocationClick(location)}
                            />
                        ))}

                        {filteredAdminLocations.length === 0 && (
                            <p className="mb-0 text-muted">No locations match your search.</p>
                        )}
                    </div>
                )}

            </div>
            )}

            {activeSection === "reviews" && (
            <div>
                <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap mb-3">
                    <h5 className="mb-0">Manage Reviews</h5>
                    <div className="d-flex align-items-center gap-2">
                        <button
                            type="button"
                            className={`tt-btn ${reviewVisibility === "visible" ? "tt-btn-secondary" : ""}`}
                            onClick={() => setReviewVisibility("visible")}
                        >
                            Visible
                        </button>
                        <button
                            type="button"
                            className={`tt-btn ${reviewVisibility === "hidden" ? "tt-btn-secondary" : ""}`}
                            onClick={() => setReviewVisibility("hidden")}
                        >
                            Hidden
                        </button>
                    </div>
                </div>

                {reviewsLoading ? (
                    <p className="mb-0 text-muted">Loading reviews...</p>
                ) : adminReviews.length === 0 ? (
                    <p className="mb-0 text-muted">
                        No {reviewVisibility} reviews found.
                    </p>
                ) : (
                    <div className="tt-reviews-list">
                        {adminReviews.map((review) => (
                            <article className="tt-review-card" key={review.review_id}>
                                <div className="tt-review-header">
                                    <div className="tt-review-meta">
                                        <div className="tt-review-author">
                                            {review.first_name} {review.last_name}
                                        </div>
                                        <div className="tt-review-date">
                                            {review.location_name}
                                        </div>
                                    </div>
                                    <div className="tt-review-rating">★ {Number(review.rating || 0).toFixed(1)}</div>
                                </div>
                                <p className="tt-review-content mb-0">{review.comment || "No comment"}</p>
                            </article>
                        ))}
                    </div>
                )}
            </div>
            )}

            {activeSection === "users" && (
            <div>
                <h5 className="mb-3">Manage Users</h5>
                {usersLoading ? (
                    <p className="mb-0 text-muted">Loading users...</p>
                ) : adminUsers.length === 0 ? (
                    <p className="mb-0 text-muted">No users found.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-sm align-middle mb-0">
                            <thead>
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">Email</th>
                                    <th scope="col">Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {adminUsers.map((account) => (
                                    <tr key={account.user_id}>
                                        <td>{account.first_name} {account.last_name}</td>
                                        <td>{account.email}</td>
                                        <td>{account.role}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            )}
        </div>
        </div>
    </div>

    {isLocationModalOpen && (
        <div
            className="tt-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-location-modal-title"
            onClick={() => setIsLocationModalOpen(false)}
        >
            <div className="tt-modal tt-admin-location-modal" onClick={(e) => e.stopPropagation()}>
                <div className="tt-modal-header">
                    <div className="tt-modal-header-left">
                        <h3 id="admin-location-modal-title" className="tt-modal-title mb-0">
                            {editingLocationId ? "Edit Location" : "Add Location"}
                        </h3>
                    </div>
                    <button
                        type="button"
                        className="tt-btn tt-btn-ghost tt-admin-modal-close"
                        aria-label="Close add location modal"
                        onClick={() => {
                            setIsLocationModalOpen(false);
                            setEditingLocationId(null);
                            setLocationForm(emptyLocation);
                        }}
                    >
                        ×
                    </button>
                </div>

                <form className="tt-modal-body tt-admin-location-form" onSubmit={handleLocationSubmit}>
                    <div className="row g-3">
                        <div className="col-12 col-md-6">
                            <label className="form-label" htmlFor="location-name">Name *</label>
                            <input
                                id="location-name"
                                className="form-control"
                                name="name"
                                value={locationForm.name}
                                onChange={handleLocationChange}
                                required
                            />
                        </div>

                        <div className="col-12 col-md-6">
                            <label className="form-label" htmlFor="location-type">Type *</label>
                            <input
                                id="location-type"
                                className="form-control"
                                name="type"
                                value={locationForm.type}
                                onChange={handleLocationChange}
                                placeholder="e.g. Attraction, Hotel, Food"
                                required
                            />
                        </div>

                        <div className="col-12">
                            <label className="form-label" htmlFor="location-address">Address *</label>
                            <input
                                id="location-address"
                                className="form-control"
                                name="address"
                                value={locationForm.address}
                                onChange={handleLocationChange}
                                placeholder="Street, building, venue name"
                                required
                            />
                        </div>

                        <div className="col-12 col-md-6">
                            <label className="form-label" htmlFor="location-city">City *</label>
                            <input
                                id="location-city"
                                className="form-control"
                                name="city"
                                value={locationForm.city}
                                onChange={handleLocationChange}
                                required
                            />
                        </div>

                        <div className="col-12 col-md-6">
                            <label className="form-label" htmlFor="location-postcode">Postcode *</label>
                            <input
                                id="location-postcode"
                                className="form-control"
                                name="postcode"
                                value={locationForm.postcode}
                                onChange={handleLocationChange}
                                required
                            />
                        </div>

                        <div className="col-12">
                            <label className="form-label" htmlFor="location-description">Short description</label>
                            <textarea
                                id="location-description"
                                className="form-control"
                                name="description_short"
                                value={locationForm.description_short}
                                onChange={handleLocationChange}
                                rows="2"
                                placeholder="One sentence users will see in cards"
                            />
                        </div>

                        <div className="col-12">
                            <details className="tt-admin-optional-details">
                                <summary>Optional details</summary>

                                <div className="row g-3 mt-1">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label" htmlFor="location-phone">Phone</label>
                                        <input
                                            id="location-phone"
                                            className="form-control"
                                            name="phone"
                                            value={locationForm.phone}
                                            onChange={handleLocationChange}
                                        />
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label className="form-label" htmlFor="location-hours">Opening hours</label>
                                        <input
                                            id="location-hours"
                                            className="form-control"
                                            name="opening_hours"
                                            value={locationForm.opening_hours}
                                            onChange={handleLocationChange}
                                            placeholder="e.g. 09:00-17:00"
                                        />
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label className="form-label" htmlFor="location-website">Website</label>
                                        <input
                                            id="location-website"
                                            className="form-control"
                                            name="website"
                                            value={locationForm.website}
                                            onChange={handleLocationChange}
                                            type="url"
                                        />
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label className="form-label" htmlFor="location-image">Image URL</label>
                                        <input
                                            id="location-image"
                                            className="form-control"
                                            name="image_url"
                                            value={locationForm.image_url}
                                            onChange={handleLocationChange}
                                            type="url"
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label" htmlFor="location-tags">Tags</label>
                                        <input
                                            id="location-tags"
                                            className="form-control"
                                            name="tags"
                                            value={locationForm.tags}
                                            onChange={handleLocationChange}
                                            placeholder="e.g. Family;Food;Museum"
                                        />
                                    </div>
                                </div>
                            </details>
                        </div>
                    </div>
                    <div className="tt-modal-footer">
                        <button
                            type="button"
                            className="tt-btn tt-btn-ghost"
                            onClick={() => {
                                setIsLocationModalOpen(false);
                                setEditingLocationId(null);
                                setLocationForm(emptyLocation);
                            }}
                            disabled={locationSaving}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="tt-btn" disabled={locationSaving}>
                            {locationSaving ? "Saving..." : editingLocationId ? "Save changes" : "Add location"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )}

    </div>
);
}