import { useMemo } from "react";


function rating(avg){
    if(typeof avg !== "number") return null;
    const n = Math.max(0,Math.min(5,Math.round(avg)));
    return "★".repeat(n) + "☆".repeat(5-n);
}

export default function LocationCard({ location, onClick }){

    const rating_val = useMemo(()=> rating(location?.avg_rating),[location?.avg_rating]);
    
    
    const fallback =
        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=60";
    
    return (
        <div className="tt-loc-card h-100"
        role= {onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={(e)=>{
            if (!onClick) return;
            if (e.key === "Enter" || e.key === " ") onClick();
        }}>
            <div className="tt-loc-imgwrap">
                <img
                    className="tt-loc-img"
                    src={location.image_url || fallback}
                    alt={location.name || "Location image"}
                    loading="lazy"
                    onError={(e) => {e.currentTarget.src=fallback;
                    }}/>
            </div>
            <div className="tt-loc-body">
                <h5 className="tt-loc-title">{location.name}</h5>

                <div className="tt-loc-info">
                    <span>{location.city}</span>
                </div>
                <div className="tt-loc-bottom">
                    {rating_val && <span className="tt-stars">{rating_val}</span>}
                    {typeof location.price_tier === "number" && location.price_tier> 0 ? (
                        <span className="tt-price">{"£".repeat(Math.min(location.price_tier, 4))}</span>):(<span />)
                    }

                </div>
            </div>
        </div>
    )
}