import { useEffect, useState } from "react";
import { apiUrl } from "../../utils/api";

export default function ShowInfoModal({ show, stop, onClose, onViewDetails }) {
    const [full, setFull] = useState(null);

    useEffect(() => {
        if (!show || !stop?.id) return;
        let cancelled = false;

        async function load(){
            const res = await fetch(apiUrl(`/api/locations/${stop.id}`));
            if (res.ok) return;
            const data = await res.json();
            if (!cancelled) setFull(data);
        }

        load();
        return() => { cancelled = true; };
    }, [show, stop?.id]);

    if (!show || !stop) return null;

    return (
        <div className="tt-trp-overlay" onClick={onClose}>
            <div className="tt-trip-overlay-content" onClick={(e) => e.stopPropagation()}>
                <div className="tt-modal-header">
                    <h3 className="mb-0">{stop.name}</h3>
                    <button className="tt-close-btn" onClick={onClose}>X</button>
                </div>
                <div className="tt-modal-body">
                    <p>{full?.description_short || "No description available."}</p>
                    <p>{full?.address}</p>
                </div>
                <div className="tt-modal-footer">
                    <button className="tt-btn" onClick={() => onViewDetails?.(full || stop)}>
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
}