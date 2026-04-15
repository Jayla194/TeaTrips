import { useEffect, useState } from "react";
import { apiUrl } from "../utils/api";
import WarningBanner from "../components/WarningBanner";

export default function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [activeSection, setActiveSection] = useState("overview");

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
            <div className="tt-profile-top">
            <span className="tt-profile-avatar" title={user.first_name}>
                {initial}
            </span>
            <div className="tt-profile-name">
                {user.first_name} {user.last_name}
            </div>
            <div className="tt-profile-email">{user.email}</div>
            </div>

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
        </div>
        </div>

        <div className="col-12 col-lg-8">
        <div className="tt-loc-card p-4">
            {activeSection === "overview" && (
            <div className="tt-admin-overview">
                <h5 className="tt-admin-overview-title">Admin Overview</h5>
                <p className="tt-admin-overview-subtitle">Key stats for TeaTrips growth and activity.</p>

                {loading ? (
                <p className="mb-0">Loading overview...</p>
                ) : (
                <div className="tt-admin-kpi-grid">
                    <div className="tt-admin-kpi-card">
                        <div className="tt-admin-kpi-label">Total locations</div>
                        <div className="tt-admin-kpi-value">{keyStats.totalLocations ?? 0}</div>
                    </div>

                    <div className="tt-admin-kpi-card">
                        <div className="tt-admin-kpi-label">Total users</div>
                        <div className="tt-admin-kpi-value">{keyStats.totalUsers ?? 0}</div>
                    </div>

                    <div className="tt-admin-kpi-card">
                        <div className="tt-admin-kpi-label">Total reviews</div>
                        <div className="tt-admin-kpi-value">{keyStats.totalReviews ?? 0}</div>
                    </div>

                    <div className="tt-admin-kpi-card tt-admin-kpi-card-wide">
                        <div className="tt-admin-kpi-label">New users (last 7 days)</div>
                        <div className="tt-admin-kpi-value">{keyStats.newUsers7d ?? 0}</div>
                    </div>

                    <div className="tt-admin-kpi-card tt-admin-kpi-card-wide">
                        <div className="tt-admin-kpi-label">New reviews (last 7 days)</div>
                        <div className="tt-admin-kpi-value">{keyStats.newReviews7d ?? 0}</div>
                    </div>
                </div>
                )}
            </div>
            )}

            {activeSection === "locations" && (
            <>
                <h5>Manage Locations</h5>
                <p className="mb-0">Add location CRUD here.</p>
            </>
            )}

            {activeSection === "reviews" && (
            <>
                <h5>Manage Reviews</h5>
                <p className="mb-0">Add moderation tools here.</p>
            </>
            )}

            {activeSection === "users" && (
            <>
                <h5>Manage Users</h5>
                <p className="mb-0">Add user management here.</p>
            </>
            )}
        </div>
        </div>
    </div>
    </div>
);
}