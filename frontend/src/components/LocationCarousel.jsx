import LocationCard from "./LocationCard";
import { useNavigate } from "react-router-dom";

export default function LocationCarousel({ title, locations }){
    
    const navigate = useNavigate();
    
    if (!Array.isArray(locations) || locations.length === 0) {
        return null;
    }

    return (
        <section className="mb-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
                <h4 className="mb-0"> {title}</h4>
                <span className="text-muted small"><strong>{locations.length} </strong>locations</span>
            </div>

            <div className="tt-carousel">
                {locations.map((loc)=>(
                    <div className="tt-carousel-item" key={loc.id}>
                        <LocationCard location={loc} onClick={() => navigate(`/locations/${loc.id}`)}/>
                    </div>
                ))}
            </div>
        </section>
    )
}