import { useEffect, useMemo, useState } from "react";
import { apiUrl } from "../utils/api";
import WarningBanner from "../components/WarningBanner";
import SearchBar from "../components/SearchBar";
import LocationCard from "../components/LocationCard";
import ReviewCard from "../components/reviews/reviewCard";
import AdminLocationModal from "../components/admin/AdminLocationModal";

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
    const [reviewSavingId, setReviewSavingId] = useState(null);
    const [reviewSearch, setReviewSearch] = useState("");
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

    function handleLocationModalCancel() {
        setIsLocationModalOpen(false);
        setEditingLocationId(null);
        setLocationForm(emptyLocation);
    }

    async function handleAdminToggleReviewVisibility(review) {
        const reviewId = Number(review?.review_id);
        if (!Number.isInteger(reviewId)) return;

        const nextVisible = !(review.is_visible === true || review.is_visible === 1);

        try {
            setReviewSavingId(reviewId);
            const res = await fetch(apiUrl(`/api/admin/reviews/${reviewId}/visibility`), {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ is_visible: nextVisible }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to update review visibility");
            }

            // The review no longer belongs in the currently selected visibility tab.
            setAdminReviews((current) => current.filter((item) => item.review_id !== reviewId));
        } catch (err) {
            setError(err.message || "Failed to update review visibility");
        } finally {
            setReviewSavingId(null);
        }
    }

const locationTypeOptions = useMemo(() => {
    const defaults = ["Attraction", "Hotel", "Food", "Entertainment", "Nature"];
    const existing = adminLocations
        .map((location) => String(location.type || "").trim())
        .filter(Boolean);

    return Array.from(new Set([...defaults, ...existing]))
        .sort((a, b) => a.localeCompare(b));
}, [adminLocations]);

const locationTagOptions = useMemo(() => {
    return Array.from(
        new Set(
            adminLocations
                .flatMap((location) => String(location.tags || "").split(/[;,]/))
                .map((tag) => tag.trim())
                .filter(Boolean)
        )
    ).sort((a, b) => a.localeCompare(b));
}, [adminLocations]);

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

const normalizedReviewSearch = reviewSearch.trim().toLowerCase();
const filteredAdminReviews = adminReviews.filter((review) => {
    if (!normalizedReviewSearch) return true;
    return [
        `${review.first_name || ""} ${review.last_name || ""}`.trim(),
        review.location_name,
    ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedReviewSearch));
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

                <div className="mb-3">
                    <SearchBar
                        value={reviewSearch}
                        onChange={setReviewSearch}
                        placeholder="Search reviews by user or location"
                        onClear={() => setReviewSearch("")}
                        containerClassName="w-100"
                        maxWidth="100%"
                    />
                </div>

                {reviewsLoading ? (
                    <p className="mb-0 text-muted">Loading reviews...</p>
                ) : filteredAdminReviews.length === 0 ? (
                    <p className="mb-0 text-muted">
                        No {reviewVisibility} reviews found for that search.
                    </p>
                ) : (
                    <div className="tt-reviews-list tt-reviews-list-admin">
                        {filteredAdminReviews.map((review) => (
                            <ReviewCard
                                key={review.review_id}
                                review={review}
                                displayName={`${review.first_name || ""} ${review.last_name || ""}`.trim() || "User"}
                                isOwner={false}
                                isAdminView
                                onToggleVisibility={handleAdminToggleReviewVisibility}
                                isToggling={reviewSavingId === review.review_id}
                            />
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

    <AdminLocationModal
        isOpen={isLocationModalOpen}
        editingLocationId={editingLocationId}
        locationForm={locationForm}
        locationSaving={locationSaving}
        typeOptions={locationTypeOptions}
        tagOptions={locationTagOptions}
        onChange={handleLocationChange}
        onSubmit={handleLocationSubmit}
        onClose={() => setIsLocationModalOpen(false)}
        onCancel={handleLocationModalCancel}
    />

    </div>
);
}