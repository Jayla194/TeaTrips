import LocationCard from "./LocationCard";
import { useNavigate } from "react-router-dom";

export default function LocationCarousel({
    title,
    locations,
    loading = false,
    emptyMessage = "",
}){
    
    const navigate = useNavigate();
    const safeLocations = Array.isArray(locations) ? locations : [];

    if (loading) {
        return (
            <section className="mb-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                    <h4 className="mb-0">{title}</h4>
                </div>
                <p className="tt-empty-note text-muted mb-0">
                    <span className="tt-teabag-icon" aria-hidden="true"></span>
                    Loading recommendations...
                </p>
            </section>
        );
    }

    if (safeLocations.length === 0) {
        if (!emptyMessage) return null;

        return (
            <section className="mb-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                    <h4 className="mb-0">{title}</h4>
                    <span className="text-muted small"><strong>0 </strong>locations</span>
                </div>
                <p className="tt-empty-note text-muted mb-0">
                    <span className="tt-teabag-icon" aria-hidden="true"></span>
                    {emptyMessage}
                </p>
            </section>
        );
    }

    return (
        <section className="mb-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
                <h4 className="mb-0">{title}</h4>
                <span className="text-muted small"><strong>{safeLocations.length} </strong>locations</span>
            </div>

            <div className="tt-carousel">
                {safeLocations.map((loc)=>(
                    <div className="tt-carousel-item" key={loc.id}>
                        <LocationCard location={loc} onClick={() => navigate(`/locations/${loc.id}`)}/>
                    </div>
                ))}
            </div>
        </section>
    )
}
