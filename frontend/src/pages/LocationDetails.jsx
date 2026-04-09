import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import MapView from "../components/MapView";
import { apiUrl } from "../utils/api";
import  LocationCarousel from "../components/LocationCarousel";
import WarningBanner from "../components/WarningBanner";
import ReviewModal from "../components/reviews/reviewModal";
import ReviewCard from "../components/reviews/reviewCard";
import { SaveIcon } from "../components/icons";


function rating(avg){
    const num = Number(avg);
    if (!Number.isFinite(num)) return null;
    const n = Math.max(0,Math.min(5,Math.round(num)));
    return "\u2605".repeat(n) + "\u2606".repeat(5-n);
}

function priceRating(tier) {
    if (typeof tier !== "number" || tier <= 0) return null;
    return "\u00a3".repeat(Math.min(4, Math.round(tier)));
}


export default function LocationDetails(){
    const { id } = useParams();
    const navigate = useNavigate();


    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,setError] = useState("");
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    
    const [similarLocations, setSimilarLocations] = useState([]);
    const [similarLoading, setSimilarLoading] = useState(true);

    const [reviews, setReviews] = useState([]);
    const [reviewOpen, setReviewOpen] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [reviewsError, setReviewsError] = useState("");
    const [descriptionLoading, setDescriptionLoading] = useState(true);

    const fallback =
        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=60";

    // Fetch location details
    useEffect(()=> {
        // used to only update the state if the component is still on screen after fetching
        let cancelled = false;

        async function load(){
            try{
                setLoading(true);
                setError("");

                const res = await fetch(apiUrl(`/api/locations/${id}`));
                if (!res.ok) throw new Error(`Failed to load (${res.status})`);

                const data = await res.json();
                if(!cancelled) setLocation(data);
            } catch (e){
                if(!cancelled) setError(e.message || "Failed to load location");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [id]);

    // Fetch generated description separately so the backend can generate it when needed
    useEffect(() => {
        let cancelled = false;

        async function loadDescription() {
            try {
                setDescriptionLoading(true);
                const res = await fetch(apiUrl(`/api/locations/${id}/description`));
                if (!res.ok) {
                    throw new Error(`Failed to load description (${res.status})`);
                }

                const data = await res.json();
                if (cancelled) return;

                setLocation((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        description_long: data.description
                    };
                });
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Failed to load description");
                }
            } finally {
                if (!cancelled) setDescriptionLoading(false);
            }
        }

        loadDescription();
        return () => {
            cancelled = true;
        };
    }, [id]);

    // Fetching saved location status
    useEffect(() => {
        let cancelled = false;

        async function loadSavedStatus(){
            try {
                const res = await fetch(apiUrl("/api/saved"),{
                    credentials:"include"
                });
                if (!res.ok){
                    if(!cancelled) setIsSaved(false);
                    return;
                }
                const saved = await res.json();

                const savedIds = new Set(saved.map((loc)=> String(loc.id)));
                if (!cancelled) setIsSaved(savedIds.has(String(id)));
            } catch(err){
                if (!cancelled) setIsSaved(false);
            }
        }
        loadSavedStatus()
        return () => {cancelled = true};
    }, [id]);

    // Fetching similar locations
    useEffect(() => {
        let cancelled = false;
        
        async function loadSimilar(){
            try {
                setSimilarLoading(true);
                const res = await fetch(apiUrl(`/api/locations/${id}/similar?limit=8`));
                if (!res.ok) throw new Error(`Failed to load similar locations (${res.status})`);

                const data = await res.json();
                if (!cancelled) setSimilarLocations(data);
            } catch (e) {
                if (!cancelled) setError(e.message || "Failed to load similar locations");
            } finally {
                if (!cancelled) setSimilarLoading(false);
            }
        }

        loadSimilar();
        return () => {
            cancelled = true;
        };
    }, [id]);

    // Fetching Reviews
    useEffect(() => {
        let cancelled = false;

        async function loadReviews(){
            try {
                setReviewsLoading(true);
                setReviewsError("");
                const res = await fetch(apiUrl(`/api/reviews/location/${id}?sort=recent`));
                if (!res.ok) throw new Error(`Failed to load reviews (${res.status})`);
                const data = await res.json();
                if (!cancelled) setReviews(data);
            } catch (e) {
                if (!cancelled) setReviewsError(e.message || "Failed to load reviews");
            } finally {
                if (!cancelled) setReviewsLoading(false);
            }
        }

        loadReviews();
        return () => {
            cancelled = true;
        };
    }, [id]);

    // Handling Create Review Modal
    async function handleCreateReview(payload) {
        await fetch(apiUrl(`/api/reviews/location/${location.id}`), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ rating: payload.rating, comment: payload.comment }),
        });
        setReviewOpen(false);
        // refresh reviews after submit
        const res = await fetch(apiUrl(`/api/reviews/location/${location.id}?sort=recent`));
        if (res.ok) setReviews(await res.json());
    }

    // Toggle Saved
    async function toggleSave(){
        setSaving(true);
        setError("");

        try{
            const method = isSaved ? "DELETE" : "POST";

            const res = await fetch(apiUrl(`/api/saved/${id}`),{
                method,
                credentials:"include"
            });

            if (res.status === 401){
                setError("Log in to save locations");
                return;
            }

            if(!res.ok){
                const text = await res.text();
                throw new Error(text || "Request Failed")
            }

            setIsSaved(!isSaved);
            setError(isSaved ?"Removed from saved Locations" :"Saved to your profile.");
        } catch(err){
            setError(err.message || "Request Failed")
        }finally {
            setSaving(false);
        }
    }

    async function handleLikeReview(reviewId) {
        setError("");
        const target = reviews.find((review) => review.review_id === reviewId);
        const liked = Boolean(target?.liked_by_me);
        const method = liked ? "DELETE" : "POST";

        try {
            const res = await fetch(apiUrl(`/api/reviews/${reviewId}/like`), {
                method,
                credentials: "include",
            });

            if (res.status === 401) {
                setError("Log in to like reviews");
                return;
            }

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                if (res.status === 403) {
                    setError(data.error || "You can't like your own review");
                } else {
                    setError(data.error || "Failed to update like");
                }
                return;
            }

            const data = await res.json();
            setReviews((prev) =>
                prev.map((review) =>
                    review.review_id === reviewId
                        ? {
                              ...review,
                              liked_by_me: data.liked,
                              like_count: data.like_count,
                          }
                        : review
                )
            );
        } catch (err) {
            setError(err.message || "Failed to update like");
        }
    }

    async function handleDeleteReview(reviewId) {
        setError("");
        try {
            const res = await fetch(apiUrl(`/api/reviews/${reviewId}`), {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.error || "Failed to delete review");
                return;
            }
            setReviews((prev) => prev.filter((review) => review.review_id !== reviewId));
        } catch (err) {
            setError(err.message || "Failed to delete review");
        }
    }

    const avgRatingNum = useMemo(() => {
        const num = Number(location?.avg_rating);
        return Number.isFinite(num) ? num : null;
    }, [location?.avg_rating]);
    const rating_val = useMemo(() => (avgRatingNum === null ? null : rating(avgRatingNum)), [avgRatingNum]);
    const price = useMemo(()=> priceRating(location?.price_tier),[location?.price_tier]);
    // Use the generated description if we have one, otherwise show the short summary.
    const aboutText = location?.description_long || location?.description_short || "";
    const aboutParagraphs = useMemo(() => {
        // Split on blank lines so two-paragraph output stays separate on the page.
        return aboutText
            .split(/\n\s*\n/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean);
    }, [aboutText]);

    if (loading){
        return (
            <div className="container py-4">
                <p className="tt-empty-note text-muted">
                    <span className="tt-teabag-icon" aria-hidden="true"></span>
                    Steeping location details...
                </p>
            </div>
        );
    }

    if (!location) return null;

    const fullAddress = [location.address, location.city, location.postcode].filter(Boolean).join(", ");

    return(
        <div className="container py-4" style={{minHeight:"100vh"}}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <button className="tt-btn" onClick={()=> navigate(-1)}>
                    <strong>{"\u21a9"}</strong> Back
                </button>

                {error && (
                    <WarningBanner
                        message={error}
                        onClose={() => setError("")}
                        variant="warning"
                    />
                )}


                {/* Save Locations Button */}
                <button className={`tt-btn tt-btn-secondary ${isSaved ? "opacity-100": ""} `}
                onClick={toggleSave}
                disabled={saving}
                title={isSaved ? "Remove": "Save"}>
                    <SaveIcon className="tt-save-icon" />
                    {saving ? "Saving..." : isSaved ? "Saved" : "Save"}
                </button>
            </div>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-1 gap-3">
                <h2 className="mb-0">{location.name}</h2>
                <div className="d-flex align-items-center gap-2">
                    {rating_val && <span className="tt-stars">{rating_val}</span>}
                    {avgRatingNum !== null && (
                        <span className="tt-avg-rating">
                            {avgRatingNum.toFixed(1)}
                        </span>
                    )}
                    <span className="tt-reviews-count">
                        {reviewsLoading ? "…" : reviews.length}
                    </span>
                </div>
            </div>

            <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
                {price && <span className="tt-price">{price}</span>}
                {location.type && (
                    <span className="badge rounded-pill bg-light text-dark border">
                        {location.type}
                    </span>
                )}
            </div>

            {/* Main Content */}
            <div className="row g-4">
                {/* Left Column */}
                    <div className="col-12 col-lg-6">
                        <div className="tt-loc-card mb-3">
                            <div className="tt-loc-imgwrap" style={{ height:280 }}>
                                <img className="tt-loc-img"
                                src={location.image_url || fallback}
                                alt = {location.name}
                                onError={(e) => {
                                    e.currentTarget.src = fallback;
                                }}
                                />
                            </div>
                        </div>

                        {/* About Section uses generated description or short as fallback */}
                        {descriptionLoading && (
                            // Tiny loading state while the description endpoint finishes.
                            <div className="tt-loc-card tt-about-card p-4 mb-3">
                                <h5 className="mb-3 tt-section-title">About</h5>
                                <p className="mb-0 tt-empty-note text-muted">Loading description...</p>
                            </div>
                        )}

                        {!descriptionLoading && aboutParagraphs.length > 0 && (
                            // Render each paragraph separately so it looks like a proper written section.
                            <div className="tt-loc-card tt-about-card p-4">
                                <h5 className="mb-3 tt-section-title">About</h5>
                                <div className="tt-about-copy">
                                    {aboutParagraphs.map((paragraph, index) => (
                                        <p
                                            key={`${location.id}-about-${index}`}
                                            className={index === aboutParagraphs.length - 1 ? "mb-0" : "mb-3"}
                                        >
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                {/* Right Column */}
                <div className="col-12 col-lg-6">
                    {/* Details Section */}
                    <div className="tt-loc-card p-3 mb-4">
                        <h5 className="mb-3 tt-section-title">Details</h5>

                        {fullAddress && (
                            <div className="mb-2">
                            <div className="tt-loc-info">Address</div>
                            <div>{fullAddress}</div>
                            </div>
                        )}

                        {location.opening_hours && (
                            <div className="mb-2">
                            <div className="tt-loc-info">Opening hours</div>
                            <div>{location.opening_hours}</div>
                            </div>
                        )}


                        {location.website && (
                            <div className="mb-2">
                            <div className="tt-loc-info">Website</div>
                            <a className="tt-link" href={location.website} target="_blank" rel="noreferrer">
                                {location.website}
                            </a>
                            </div>
                        )}

                        {location.phone && (
                            <div className="mb-2">
                            <div className="tt-loc-info">Phone</div>
                            <div>{location.phone}</div>
                            </div>
                        )}

                        {location.lat && location.lon && (
                            <a className="tt-map-btn tt-btn"
                            href={`https://www.google.com/maps?q=${location.lat},${location.lon}`}
                            target="blank"
                            rel="noreferrer">
                                Open in Google Maps
                            </a>
                        )}
                        </div>

                        <div className="tt-loc-card p-3 mb-4">
                            <h5 className="mb-3 tt-section-title">Map</h5>
                            <div className="rounded-3 overflow-hidden"
                            style={{ height: 320}}>
                                <MapView mode="single" selectedId={id}/>
                            </div>
                        </div>

                    </div>


                    {/* Similar Locations Placeholder */}
                        <div className="tt-loc-card p-3">
                            {similarLoading &&(
                                <p className="tt-empty-note text-muted mt-4 mb-0">
                                    <span className="tt-teabag-icon" aria-hidden="true"></span>
                                    Loading similar locations...
                                </p>
                            )}
                            {!similarLoading && similarLocations.length > 0 && (
                                <div className="mt-4">
                                    <LocationCarousel title="Similar Locations" locations={similarLocations} />
                                </div>
                            )}
                            {!similarLoading && similarLocations.length === 0 && (
                                <p className="tt-empty-note text-muted mt-4 mb-0">
                                    <span className="tt-teabag-icon" aria-hidden="true"></span>
                                    No similar locations found.
                                </p>
                            )}
                        </div>


                        {/* Reviews Section */}
                        <div className="tt-reviews-section">
                        <div className="tt-reviews-header">
                            <div className="tt-reviews-titlewrap">
                                <div className="tt-reviews-title-row">
                                    <h3 className="tt-section-title">Reviews</h3>
                                    <span className="tt-reviews-count">
                                        {reviewsLoading ? "…" : reviews.length}
                                    </span>
                                </div>
                                <p className="tt-reviews-subtitle">Share your thoughts or read what others said.</p>
                            </div>
                            <button className="tt-btn" onClick={() => setReviewOpen(true)}>
                                Write a review
                            </button>
                        </div>

                        <ReviewModal
                            isOpen={reviewOpen}
                            mode="create"
                            onClose={() => setReviewOpen(false)}
                            onSubmit={handleCreateReview}
                            locationName={location.name}
                        />

                        {reviewsLoading && (
                            <p className="tt-empty-note text-muted mt-4">Loading reviews...</p>
                        )}

                        {reviewsError && (
                            <WarningBanner
                            message={reviewsError}
                            onClose={() => setReviewsError("")}
                            variant="warning"
                            />
                        )}

                        {!reviewsLoading && reviews.length === 0 && (
                            <p className="tt-empty-note text-muted mt-4">
                            No reviews yet. Be the first to review!
                            </p>
                        )}

                        <div className="tt-reviews-list mt-4">
                            {reviews.map((review) => (
                            <ReviewCard
                                key={review.review_id}
                                review={review}
                                displayName={review.first_name}
                                isOwner={review.is_owner}
                                onLike={handleLikeReview}
                                onDelete={handleDeleteReview}
                            />
                            ))}
                        </div>
                    </div>

                </div>
            </div>
    );
}
