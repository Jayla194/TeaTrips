import { useEffect, useState } from "react";
import { apiUrl } from "../../utils/api";

function getPreviewText(text) {
  const cleaned = String(text || "").trim();
  if (!cleaned) return "No description available.";

  const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
  const preview = sentences.slice(0, 2).join(" ").trim();
  return preview ? `${preview}...` : "No description available.";
}

export default function ShowInfoModal({
  show,
  stop,
  anchor,
  onClose,
  onViewDetails,
}) {
  const [full, setFull] = useState(null);
  const locationId = Number(stop?.locationId ?? stop?.id);

  // Load full location details when the modal is shown
  useEffect(() => {
    if (!show || !Number.isFinite(locationId)) return;
    let cancelled = false;
    setFull(null);

    async function load() {
      try {
        const res = await fetch(apiUrl(`/api/locations/${locationId}`));
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setFull(data);
      } catch (err) {
        if (!cancelled) setFull(null);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [show, locationId]);

  if (!show || !stop) return null;

  // Anchors card to map marker position
  const anchoredStyle = anchor
    ? {
        left: Math.max(12, Math.min(window.innerWidth - 312, anchor.x)),
        top: Math.max(80, Math.min(window.innerHeight - 180, anchor.y)),
        right: "auto",
        bottom: "auto",
        transform: anchor.preferLeft
          ? "translate(calc(-100% - 12px), -50%)"
          : "translate(12px, -50%)",
      }
    : undefined;

  return (
    <div className="tt-trp-overlay" onClick={onClose}>
      <div
        className={`tt-trip-overlay-content${anchor ? " tt-trip-overlay-content-anchored" : ""}`}
        style={anchoredStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tt-modal-header">
          <h3 className="mb-0">{stop.name}</h3>
          <button className="tt-close-btn" onClick={onClose}>
            X
          </button>
        </div>
        <div className="tt-modal-body">
          <p>{getPreviewText(full?.description_long || full?.description_short)}</p>
          <p>{full?.address}</p>
        </div>
        <div className="tt-modal-footer">
          <button
            className="tt-btn"
            onClick={() => onViewDetails?.(full || stop)}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
