import { useNavigate } from "react-router-dom";
import { useState, useEffect} from "react";
import LocationCard from "../components/LocationCard";
import { apiUrl } from "../utils/api";
import WarningBanner from "../components/WarningBanner";
import ReviewCard from "../components/reviews/reviewCard";
import ReviewModal from "../components/reviews/reviewModal";
import ChangePasswordModal from "../components/changePasswordModal";
import ConfirmModal from "../components/ConfirmModal";
import {
    OverviewIcon,
    SaveIcon,
    AddIcon,
    ExploreIcon,
    LightMode,
    DarkMode,
    LockIcon,
} from "../components/icons";

export default function Profile(){
    
    const [user,setUser] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [savedLocations, setSavedLocations] = useState([]);
    const [visible, setVisible] = useState(6);

    const [itineraries, setItineraries] = useState([]);
    const [itineraryLoading, setItineraryLoading] = useState(false);
    const [itineraryError, setItineraryError] = useState("");

    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewsError, setReviewsError] = useState("");
    const [reviewOpen, setReviewOpen] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [reviewDeleteTarget, setReviewDeleteTarget] = useState(null);

    // Controls which profile section is visible in the main panel
    const [activeSection, setActiveSection] = useState("overview");
    const [changePassOpen, setChangePassOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        try {
            return localStorage.getItem("tt-dark-mode") === "true";
        } catch {
            return false;
        }
    });
    const [prefsOpen, setPrefsOpen] = useState(false);
    const [showDeleteAccount, setShowDeleteAccount] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const root = document.documentElement;
        if (darkMode) {
            root.classList.add("tt-dark");
        } else {
            root.classList.remove("tt-dark");
        }
        try {
            localStorage.setItem("tt-dark-mode", String(darkMode));
        } catch {
            // ignore
        }
    }, [darkMode]);

    // Loads user info and displays profile if logged in
    useEffect(()=> {
        async function loadUser(){
            try{
                const res = await fetch(apiUrl("/api/auth/user"),{
                    credentials:"include"
                });

                if(!res.ok){
                    setUser(null);
                    return;
                }
                const data = await res.json();
                setUser(data.user);
            }catch {
                setUser(null);
            } finally{
                setLoading(false)};
        }
        loadUser();
    }, []);

    // Loads user's saved locations
    useEffect (()=>{
        async function loadSaved(){
            try{
                setLoading(true);
                setError("");

                const res = await fetch(apiUrl("/api/saved"),{
                    credentials:"include"
                });

                if(!res.ok){
                    setError("Failed to load saved locations");
                }
                const data = await res.json();
                setSavedLocations(data);
            }catch(err){
                setError(err.message);
            }finally{
                setLoading(false);
            }
        } loadSaved();
    },[]);

    // Loads user's reviews
    useEffect(() => {
        async function loadItineraries() {
            try {
                setItineraryLoading(true);
                setItineraryError("");

                const res = await fetch(apiUrl("/api/itinerary"), {
                    credentials: "include",
                });

                if (!res.ok) {
                    setItineraryError("Failed to load itineraries");
                    setItineraries([]);
                    return;
                }

                const data = await res.json();
                setItineraries(Array.isArray(data) ? data : []);
            } catch (err) {
                setItineraryError(err.message || "Failed to load itineraries");
                setItineraries([]);
            } finally {
                setItineraryLoading(false);
            }
        }
        loadItineraries();
    }, []);

    // Loads user's reviews
    useEffect(() => {
        async function loadReviews() {
            try {
                setReviewsLoading(true);
                setReviewsError("");

                const res = await fetch(apiUrl("/api/reviews/user"), {
                    credentials: "include",
                });

                if (!res.ok) {
                    setReviewsError("Failed to load your reviews");
                    setReviews([]);
                    return;
                }

                const data = await res.json();
                setReviews(Array.isArray(data) ? data : []);
            } catch (err) {
                setReviewsError(err.message || "Failed to load your reviews");
                setReviews([]);
            } finally {
                setReviewsLoading(false);
            }
        }
        loadReviews();
    }, []);



    // Loading page while user and saved locations are fetched
    if(loading){
        return (
            <div className="container py-4" style={{minHeight:"100vh"}}>
                <p className="tt-empty-note text-muted">
                    <span className="tt-teabag-icon" aria-hidden="true"></span>
                    Loading your profile...
                </p>
            </div>
        );
    }

    // Returns when user isn't logged in
    if (!user){
        return (
            <div className="container py-4" style={{minHeight:"100vh"}}>
                <div>
                    Please log in to view your profile<br/> <a href="/login">Log in</a>
                </div>
            </div>
        );
    }

    const initial = user?.first_name?.[0]?.toUpperCase();
    const visibleLocations = savedLocations.slice(0,visible);
    const itineraryCards = itineraries.slice(0, 6);

    // Calculates day count for itinerary
    function getDayCount(itinerary) {
        if (!itinerary?.start_date || !itinerary?.end_date) return null;
        const start = new Date(itinerary.start_date);
        const end = new Date(itinerary.end_date);
        // Check for invalid dates
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
        const diff = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
        // Only return positive counts, otherwise null
        return diff > 0 ? diff : null;
    }

    function hasTripAlreadyHappened(itinerary) {
        const reference = itinerary?.end_date || itinerary?.start_date;
        if (!reference) return false;
        const tripDate = new Date(`${String(reference).slice(0, 10)}T00:00:00`);
        if (Number.isNaN(tripDate.getTime())) return false;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return tripDate < today;
    }

    function handleEditReview(review) {
        // Open the modal with the selected review pre-filled
        setEditingReview(review);
        setReviewOpen(true);
    }

    async function handleUpdateReview(payload) {
        // Persist edits, then refresh the user's reviews
        if (!editingReview) return;
        try {
            const res = await fetch(apiUrl(`/api/reviews/${editingReview.review_id}`), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ rating: payload.rating, comment: payload.comment }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setReviewsError(data.error || "Failed to update review");
                return;
            }
            setReviewOpen(false);
            setEditingReview(null);
            const refreshed = await fetch(apiUrl("/api/reviews/user"), {
                credentials: "include",
            });
            if (refreshed.ok) {
                const data = await refreshed.json();
                setReviews(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            setReviewsError(err.message || "Failed to update review");
        }
    }

    async function handleChangePassword({ currentPassword, newPassword }) {
        try {
            const res = await fetch(apiUrl("/api/auth/change-password"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                return { error: data.message || data.error || "Failed to change password" };
            }

            setChangePassOpen(false);
            return { ok: true };
        } catch (err) {
            return { error: err.message || "Failed to change password" };
        }
    }
    // Sets review to invisible, effectively deletes it without removing it in the database
    function handleDeleteReviewRequest(reviewId) {
        setReviewDeleteTarget(reviewId);
    }

    async function handleDeleteReview(reviewId) {
        try {
            const res = await fetch(apiUrl(`/api/reviews/${reviewId}`), {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setReviewsError(data.error || "Failed to delete review");
                return;
            }
            setReviews((prev) => prev.filter((review) => review.review_id !== reviewId));
        } catch (err) {
            setReviewsError(err.message || "Failed to delete review");
        }
    }

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

            {/* Left Side - Profile (30%) */}
            <div className="col-12 col-lg-4">
                <div className="tt-profile-card tt-profile-panel p-4">
                    <div className="tt-profile-top">
                        <span className="tt-profile-avatar" title={user.first_name}>
                            {initial}
                        </span>
                        <div className="tt-profile-name">{user.first_name} {user.last_name}</div>
                        <div className="tt-profile-email">{user.email}</div>
                    </div>

                    <div className="tt-profile-divider" />

                    <div className="tt-profile-stats">
                        <div className="tt-profile-stat">
                            <div className="tt-profile-stat-number">{savedLocations.length}</div>
                            <div className="tt-profile-stat-label">saved</div>
                        </div>
                        <div className="tt-profile-stat">
                            <div className="tt-profile-stat-number">{itineraries.length}</div>
                            <div className="tt-profile-stat-label">trips</div>
                        </div>
                        <div className="tt-profile-stat">
                            <div className="tt-profile-stat-number">{reviews.length}</div>
                            <div className="tt-profile-stat-label">reviews</div>
                        </div>
                    </div>

                    <div className="tt-profile-divider" />

                        <div className="tt-profile-nav">
                            <div className="tt-profile-nav-title">My Profile</div>
                            <button
                                type="button"
                                className={`tt-profile-nav-item ${activeSection === "overview" ? "is-active" : ""}`}
                                onClick={() => setActiveSection("overview")}
                            >
                            <OverviewIcon className="tt-profile-nav-icon" />
                            Overview
                        </button>
                        <button
                            type="button"
                            className={`tt-profile-nav-item ${activeSection === "saved" ? "is-active" : ""}`}
                            onClick={() => setActiveSection("saved")}
                        >
                            <SaveIcon className="tt-profile-nav-icon" />
                            Saved locations
                            <span className="tt-profile-nav-count">{savedLocations.length}</span>
                        </button>
                        <button
                            type="button"
                            className={`tt-profile-nav-item ${activeSection === "itineraries" ? "is-active" : ""}`}
                            onClick={() => setActiveSection("itineraries")}
                        >
                            <AddIcon className="tt-profile-nav-icon" />
                            Itineraries
                            <span className="tt-profile-nav-count">{itineraries.length}</span>
                        </button>
                        <button
                            type="button"
                            className={`tt-profile-nav-item ${activeSection === "reviews" ? "is-active" : ""}`}
                            onClick={() => setActiveSection("reviews")}
                        >
                            <ExploreIcon className="tt-profile-nav-icon" />
                            My reviews
                            <span className="tt-profile-nav-count">{reviews.length}</span>
                        </button>
                    </div>

                    <div className="tt-profile-divider" />

                    <div className="tt-profile-nav">
                        <div className="tt-profile-nav-title">Account</div>
                        {/*Drop down edit profile button with change pass and delete, separate to preferences*/}
                        <button
                            type="button"
                            className="tt-profile-nav-item"
                            onClick={() => setPrefsOpen((prev) => !prev)}
                        >
                            <OverviewIcon className="tt-profile-nav-icon" />
                            Profile and Preferences
                            <span className={`tt-profile-pref-caret ${prefsOpen ? "open" : ""}`}>▾</span>

                            </button>
                        {prefsOpen && (
                            <div className="tt-profile-pref-panel">
                                <button
                                    type="button"
                                    className="tt-profile-pref-option"
                                    onClick={() => setDarkMode((prev) => !prev)}
                                >
                                    {darkMode ? (
                                        <LightMode className="tt-profile-pref-icon" />
                                    ) : (
                                        <DarkMode className="tt-profile-pref-icon" />
                                    )}
                                    <span>{darkMode ? "Light mode" : "Dark mode"}</span>
                                </button>
                                <button className="tt-profile-pref-option" onClick={() => setChangePassOpen(true)}>
                                    <LockIcon className="tt-profile-pref-icon" />
                                    Change password
                                </button>
                                <button
                                    type="button"
                                    className="tt-profile-pref-option tt-profile-danger-btn"
                                    onClick={() => setShowDeleteAccount(true)}
                                >
                                    Delete account
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Side (70%) */}
            <div className="col-12 col-lg-8">
                <div className="row g-4">

                    {/* Saved Locations */}
                    {(activeSection === "overview" || activeSection === "saved") && (
                    <div className="col-12">
                        <div className="tt-loc-card p-4">
                            <h5 className="mb-3 d-flex align-items-center gap-2">
                                <span className="tt-teabag-icon tt-teabag-lg" aria-hidden="true"></span>
                                Saved Locations
                            </h5>
                            <hr />

                            {savedLocations.length === 0 && (
                                <p className="tt-empty-note opacity-75 mb-0">
                                    <span className="tt-teabag-icon" aria-hidden="true"></span>
                                    You haven’t saved any locations yet.
                                </p>
                            )}
                            <div className="row g-3">
                                {visibleLocations.map((loc)=>(
                                    <div key={loc.id} className="col-12 col-md-6 col-xl-4">
                                        <LocationCard location={loc} onClick={()=> navigate(`/locations/${loc.id}`)}/>
                                    </div>
                                ))}

                                {visible < savedLocations.length && (
                                    <a className="mt-3 tt-navlink" style={{color:"#372416", textDecoration:"none"}} onClick={()=> setVisible(prev => prev + 6)}>
                                        Load More
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                    )}

                    {/* Saved Itineraries */}
                    {(activeSection === "overview" || activeSection === "itineraries") && (
                    <div className="col-12">
                        <div className="tt-loc-card p-4">
                            <h5 className="mb-3 d-flex align-items-center gap-2">
                                <span className="tt-teabag-icon tt-teabag-lg" aria-hidden="true"></span>
                                Saved Itineraries
                            </h5>
                            <button
                                className="tt-btn tt-btn-primary"
                                onClick={()=>navigate(`/itinerary`)}>+ Add Itinerary</button>
                            <hr />
                            {itineraryError && (
                                <WarningBanner
                                    message={itineraryError}
                                    onClose={() => setItineraryError("")}
                                    variant="warning"
                                />
                            )}
                            {itineraryLoading && (
                                <p className="tt-empty-note opacity-75 mb-0">
                                    <span className="tt-teabag-icon" aria-hidden="true"></span>
                                    Loading itineraries...
                                </p>
                            )}
                            {!itineraryLoading && itineraryCards.length === 0 && (
                                <p className="tt-empty-note opacity-75 mb-0">
                                    <span className="tt-teabag-icon" aria-hidden="true"></span>
                                    You have no saved itineraries yet.
                                </p>
                            )}
                            {!itineraryLoading && itineraryCards.length > 0 && (
                                <div className="tt-itinerary-grid">
                                    {itineraryCards.map((itinerary) => {
                                        const dayCount = getDayCount(itinerary);
                                        const hasHappened = hasTripAlreadyHappened(itinerary);
                                        const title = itinerary.trip_name || "Untitled trip";
                                        const subtitleParts = [
                                            itinerary.city ? String(itinerary.city) : "",
                                            dayCount ? `${dayCount} day itinerary` : "Itinerary",
                                        ].filter(Boolean);
                                        const subtitle = subtitleParts.join(" • ");
                                        return (
                                            <div
                                                key={itinerary.itinerary_id}
                                                className={`tt-itinerary-card ${hasHappened ? "tt-itinerary-card-past" : ""}`}
                                            >
                                                <div className="tt-itinerary-main">
                                                    <div className="tt-itinerary-title">{title}</div>
                                                    <div className="tt-itinerary-sub">{subtitle}</div>
                                                    {hasHappened && (
                                                        <div className="tt-itinerary-note">This trip has already happened.</div>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="tt-btn tt-btn-secondary mt-3"
                                                        onClick={() => navigate(`/itinerary?edit=${itinerary.itinerary_id}`)}
                                                    >
                                                        {hasHappened ? "View itinerary" : "Edit itinerary"}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                    )}

                    {/* Your Reviews */}
                    {(activeSection === "overview" || activeSection === "reviews") && (
                    <div className="col-12">
                        <div className="tt-loc-card p-4">
                            <h5 className="mb-3 d-flex align-items-center gap-2">
                                <span className="tt-teabag-icon tt-teabag-lg" aria-hidden="true"></span>
                                Your Reviews
                            </h5>
                            <hr />

                            {reviewsError && (
                                <WarningBanner
                                    message={reviewsError}
                                    onClose={() => setReviewsError("")}
                                    variant="warning"
                                />
                            )}

                            {reviewsLoading && (
                                <p className="tt-empty-note opacity-75 mb-0">
                                    <span className="tt-teabag-icon" aria-hidden="true"></span>
                                    Loading your reviews...
                                </p>
                            )}

                            {!reviewsLoading && reviews.length === 0 && (
                                <p className="tt-empty-note opacity-75 mb-0">
                                    <span className="tt-teabag-icon" aria-hidden="true"></span>
                                    You have not posted any reviews yet.
                                </p>
                            )}

                            {!reviewsLoading && reviews.length > 0 && (
                                <div className="tt-reviews-list">
                                    {reviews.map((review) => (
                                        <div key={review.review_id} className="tt-profile-review">
                                            <ReviewCard
                                                review={{ ...review, first_name: user.first_name }}
                                                displayName={(
                                                    <button
                                                        type="button"
                                                        className="tt-review-location tt-navlink"
                                                        onClick={() => navigate(`/locations/${review.location_id}`)}
                                                    >
                                                        {review.location_name || "View location"}
                                                    </button>
                                                )}
                                                isOwner
                                                onEdit={handleEditReview}
                                                onDelete={(reviewId) => handleDeleteReviewRequest(reviewId)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    )}

                </div>
            </div>

        </div>

        <ReviewModal
            isOpen={reviewOpen}
            mode="edit"
            initialReview={editingReview}
            onClose={() => {
                setReviewOpen(false);
                setEditingReview(null);
            }}
            onSubmit={handleUpdateReview}
            locationName={editingReview?.location_name}
        />
        <ChangePasswordModal
            isOpen={changePassOpen}
            onClose={() => setChangePassOpen(false)}
            onSubmit={handleChangePassword}
        />
        <ConfirmModal
            isOpen={Boolean(reviewDeleteTarget)}
            title="Delete review"
            message="This action will permanently remove your review."
            confirmLabel="Delete review"
            cancelLabel="Keep review"
            confirmClassName="tt-btn tt-btn-secondary"
            onCancel={() => setReviewDeleteTarget(null)}
            onConfirm={() => {
                if (reviewDeleteTarget) {
                    handleDeleteReview(reviewDeleteTarget);
                }
                setReviewDeleteTarget(null);
            }}
        />
        <ConfirmModal
            isOpen={showDeleteAccount}
            title="Delete account"
            message="This action cannot be undone. All your data will be removed."
            confirmLabel="Delete account"
            cancelLabel="Keep account"
            confirmClassName="tt-btn tt-btn-secondary"
            onCancel={() => setShowDeleteAccount(false)}
            onConfirm={() => {
                setShowDeleteAccount(false);
                // TODO: hook up delete account
            }}
        />
    </div>
);
}
