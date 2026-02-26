import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import MapView from "../components/MapView";


function rating(avg){
    if(typeof avg !== "number") return null;
    const n = Math.max(0,Math.min(5,Math.round(avg)));
    return "★".repeat(n) + "☆".repeat(5-n);
}

function priceRating(tier) {
    if (typeof tier !== "number" || tier <= 0) return null;
    return "£".repeat(Math.min(4, Math.round(tier)));
}


export default function LocationDetails(){
    const { id } = useParams();
    const navigate = useNavigate();


    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,setError] = useState("");
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    const fallback =
        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=60";

    useEffect(()=> {
        // used to only update the state if the component is still on screen after fetching
        let cancelled = false;

        async function load(){
            try{
                setLoading(true);
                setError("");

                const res = await fetch(`http://localhost:5000/api/locations/${id}`);
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

    // Fetching saved location status
    useEffect(() => {
        let cancelled = false;
        async function loadSavedStatus(){
            try {
                const res = await fetch("http://localhost:5000/api/saved",{
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


    // Toggle Saved
    async function toggleSave(){
        setSaving(true);
        setError("");

        try{
            const method = isSaved ? "DELETE" : "POST";

            const res = await fetch(`http://localhost:5000/api/saved/${id}`,{
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
            setError(isSaved ? "Saved to your profile.":"Removed from saved Locations");
        } catch(err){
            setError(err.message || "Request Failed")
        }finally {
            setSaving(false);
        }
    }

    const rating_val = useMemo(()=> rating(location?.avg_rating),[location?.avg_rating]);
    const price = useMemo(()=> priceRating(location?.price_tier),[location?.price_tier]);

    if (loading){
        return <div className="container py-4"> Loading...</div>
    }

    if (!location) return null;

    const fullAddress = [location.address, location.city, location.postcode].filter(Boolean).join(", ");

    return(
        <div className="container py-4" style={{minHeight:"100vh"}}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <button className="tt-btn" onClick={()=> navigate(-1)}>
                    <strong>⇽</strong> Back
                </button>

                {error && (
                    <div className="alert alert-warning py-2 mb-3" role="alert">
                        {error}
                        <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={() => setError("")}
                        ></button>
                    </div>
                    )}


                {/* Save Locations Button */}
                <button className={`tt-btn tt-btn-secondary ${isSaved ? "opacity-100": ""} `}
                onClick={toggleSave}
                disabled={saving}
                title={isSaved ? "Remove": "Save"}>
                    <strong>{isSaved ? "★" : "✰"}</strong> {saving ? "Saving..." : isSaved ? "Saved" : "Save"}
                </button>
            </div>
            <h2 className="mb-1">{location.name}</h2>

            <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
                {rating && <span className="tt-stars">{rating_val}</span>}
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

                        {/* About Section description short placeholder*/}
                        {location.description_short && (
                            <div className="tt-loc-card p-3">
                                <h5 className="mb-2">About</h5>
                                <p className="mb-0">{location.description_short}</p>
                            </div>
                        )}
                    </div>

                {/* Right Column */}
                <div className="col-12 col-lg-6">
                    {/* Details Section */}
                    <div className="tt-loc-card p-3 mb-4">
                        <h5 className="mb-3">Details</h5>

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
                            <a href={location.website} target="_blank" rel="noreferrer">
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
                            <h5 className="mb-3">Map</h5>
                            <div className="rounded-3 overflow-hidden"
                            style={{ height: 320}}>
                                <MapView mode="single" selectedId={id}/>
                            </div>
                        </div>

                        {/* Similar Locations Placeholder */}
                        <div className="tt-loc-card p-3 opacity-75">
                            <h5 className="mb-1">Similar locations</h5>
                            <p className="mb-0">
                            Coming Soon
                            </p>
                        </div>
                    </div>
                </div>
            </div>
    );
}