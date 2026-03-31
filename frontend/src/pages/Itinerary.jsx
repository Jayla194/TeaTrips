import MapView from "../components/MapView";
import TripDetails from "../components/Itinerary/TripDetails";
import HotelCard from "../components/Itinerary/HotelCard";
import TripModal from "../components/Itinerary/TripModal";
import TripDay from "../components/Itinerary/TripDay";
import ShowInfoModal from "../components/Itinerary/ShowInfoModal";


import { Container, Row, Col, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { apiUrl } from "../utils/api";
import { getDayColour } from "../utils/dayColours";

function createBlankItinerary() {
    return {
        meta: {
            city: "",
            days: 0,
            stopsPerDay: 3,
        },
        days: [],
        hotel: null,
        warnings: [],
    };
}

export default function Itinerary() {
    const [itinerary, setItinerary] = useState(createBlankItinerary);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [saveMessage, setSaveMessage] = useState(null);
    const [saving, setSaving] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedStop, setSelectedStop] = useState(null);
    const [showStopModal, setShowStopModal] = useState(false);

    const [tripName, setTripName] = useState("Insert Name");
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const navigate = useNavigate();

    const builderHelp = (
        <Tooltip id="tt-itinerary-help" className="tt-help-tooltip">
            <div className="tt-help-tooltip-title">Design your Perfect Trip</div>
            <div className="tt-help-tooltip-item">
                <span className="tt-help-tooltip-label">Manual:</span> Add days yourself, then add or move locations to shape the perfect plan.
            </div>
            <div className="tt-help-tooltip-item">
                <span className="tt-help-tooltip-label">Generated:</span> Use “Generate Trip” to auto-fill days and customise to your liking. You can select from the city you wish to travel to, the number of days you want to spend there, and how many locations you want to visit each day. TeaTrips will then create a personalised itinerary for you based on your preferences and previous travel history.
            </div>
        </Tooltip>
    );

    useEffect(() => {
        if (itinerary?.days.length) return;
    const cached = sessionStorage.getItem("cachedItinerary");
    if (!cached) return;
    const parsed =  JSON.parse(cached);
    if (parsed?.itinerary) {
        setItinerary(parsed.itinerary);
        setStartDate(parsed.startDate || "");
        setEndDate(parsed.endDate || "");
    }}, []);



    function daysBetweenInclusive(startDate, endDate) {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    async function generateItinerary(formData) {
        if (!formData?.city) {
            setError("Please choose a city.");
            return;
        }

        const days = daysBetweenInclusive(formData.startDate, formData.endDate);
        if (days < 1) {
            setError("Please choose valid dates.");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const res = await fetch(apiUrl("/api/itinerary/generate"), {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    city: formData.city,
                    days,
                    stopsPerDay: formData.stopsPerDay,
                }),
            });

            if (!res.ok) {
                throw new Error(`Request failed: ${res.status}`);
            }

            const data = await res.json();
            setItinerary(data);
            setStartDate(formData.startDate || "");
            setEndDate(formData.endDate || "");
        } catch (err) {
            console.error(err);
            setError("Failed to generate itinerary.");
        } finally {
            setLoading(false);
        }
    }

    async function handleSaveItinerary() {
        const city = itinerary?.meta?.city || "";
        if (!tripName || !tripName.trim()) {
            setSaveError("Please enter a trip name before saving.");
            return;
        }
        if (!city) {
            setSaveError("Please generate a trip before saving.");
            return;
        }
        if (!Array.isArray(itinerary?.days) || itinerary.days.length === 0) {
            setSaveError("Itinerary must contain at least one day.");
            return;
        }

        try {
            setSaving(true);
            setSaveError(null);
            setSaveMessage(null);

            const payload = {
                tripName: tripName.trim(),
                city,
                startDate: startDate || null,
                endDate: endDate || null,
                hotelLocationId: itinerary?.hotel?.id ?? null,
                days: itinerary.days.map((day) => ({
                    dayNumber: day.day,
                    stops: Array.isArray(day.stops)
                        ? day.stops.map((stop, index) => ({
                            locationId: stop.id,
                            stopPosition: index + 1,
                        }))
                        : [],
                })),
            };

            const res = await fetch(apiUrl("/api/itinerary/save"), {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                if (res.status === 401) {
                    throw new Error("Please log in to save itineraries.");
                }
                const body = await res.json().catch(() => null);
                throw new Error(body?.message || "Failed to save itinerary.");
            }

            setSaveMessage("Itinerary saved to your profile.");
        } catch (err) {
            setSaveError(err.message || "Failed to save itinerary.");
        } finally {
            setSaving(false);
        }
    }

    function handleAddDay() {
        setItinerary((prev) => {
            const prevDays = Array.isArray(prev?.days) ? prev.days : [];
            const nextDayNumber = prevDays.length + 1;
            const nextDays = [...prevDays, { day: nextDayNumber, stops: [] }];

            return {
                ...prev,
                meta: { ...(prev.meta || {}), days: nextDays.length },
                days: nextDays,
            };
        });
    }
    
    // Removes locations from the itinerary
    function handleRemoveStop(dayNumber, stopIndex) {
        setItinerary((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                days: prev.days.map((day) =>
                    day.day !== dayNumber ? day : { ...day, stops: day.stops.filter((_, i) => i !== stopIndex) }
                ),
            };
        });
    }

    // Updates the ordering of itinerary locations
    function handleMoveStop(dayNumber, fromIndex, toIndex) {
        setItinerary((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                days: prev.days.map((day) => {
                    if (day.day !== dayNumber) return day;
                    if (toIndex < 0 || toIndex >= day.stops.length) return day;

                    const nextStops = [...day.stops];
                    const [moved] = nextStops.splice(fromIndex, 1);
                    nextStops.splice(toIndex, 0, moved);
                    return { ...day, stops: nextStops };
                }),
            };
        });
    }
    function handleOpenStop(stop){
        setSelectedStop(stop);
        setShowStopModal(true);
    }

    function handleViewDetails(stop){
        cacheItinerary(itinerary);
        navigate(`/locations/${stop.id}`);
    }

    function cacheItinerary(itinerary) {
        sessionStorage.setItem("cachedItinerary", JSON.stringify({
            itinerary:itinerary,
            startDate,
            endDate,
        }));
    }

    // Loads location markers onto the map
    const itineraryMapLocations = useMemo(() =>{
        if (!Array.isArray(itinerary?.days)) return [];

        return itinerary.days.flatMap((day)=>{
            if(!Array.isArray(day?.stops)) return[];

            return day.stops.map((stop,stopIndex) => ({
                id:`${day.day}-${stopIndex}-${stop?.id??"stop"}`,
                name: stop?.name || `Day ${day.day} stop`,
                lat: stop?.lat,
                lon: stop.lon,
                day: day.day, // Used for colour coding markers for each day
            }));
        })
    }, [itinerary]);

    return (
        <div className="tt-itinerary-page">
            <Container className="py-4">
                <Row className="tt-itinerary-layout">
                    <Col lg={6} className="mb-4 tt-itinerary-left-col">
                        <div className="tt-itinerary-builder">
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <div className="d-flex align-items-center gap-2">
                                    <h1 className="tt-title mb-0">Itinerary Builder</h1>
                                </div>
                                <div className="d-flex gap-2">
                                    <Button
                                        className="tt-btn tt-btn-secondary"
                                        onClick={handleSaveItinerary}
                                        disabled={saving}
                                    >
                                        {saving ? "Saving..." : "Save"}
                                    </Button>
                                    <Button
                                        className="tt-btn tt-btn-primary"
                                        onClick={() => setShowGenerateModal(true)}>
                                        Generate Trip
                                    </Button>
                                </div>
                            </div>
                            {error && <p className="text-danger mb-3">{error}</p>}
                            {saveError && <p className="text-danger mb-3">{saveError}</p>}
                            {saveMessage && <p className="text-success mb-3">{saveMessage}</p>}
                            {loading && <p className="mb-3">Generating itinerary...</p>}

                            <TripDetails
                                tripName={tripName}
                                setTripName={setTripName}
                                startDate={startDate}
                                setStartDate={setStartDate}
                                endDate={endDate}
                                setEndDate={setEndDate}/>
                            {itinerary?.hotel && <HotelCard hotel={itinerary.hotel} />}
                        </div>

                        {itinerary.days.length === 0 ? (
                            <div className="tt-day-card">
                                <div className="tt-day-body">
                                    <p className="mb-3 text-muted">
                                        Your itinerary is empty. Add a day manually or generate a trip.
                                    </p>
                                    <Button className="tt-btn tt-btn-primary" onClick={handleAddDay}>
                                        + Add Day
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {itinerary.days.map((day) => (
                                    <TripDay
                                        key={day.day}
                                        day={day}
                                        dayColour={getDayColour(day.day)}
                                        onRemoveStop={handleRemoveStop}
                                        onMoveStop={handleMoveStop}
                                        onOpenStop={handleOpenStop}
                                    />
                                ))}
                                <ShowInfoModal
                                    show={showStopModal}
                                    stop={selectedStop}
                                    onClose={() => setShowStopModal(false)}
                                    onViewDetails={handleViewDetails}
                                />
                                <div className="mt-3">
                                    <Button className="tt-btn tt-btn-primary" onClick={handleAddDay}>
                                        + Add Day
                                    </Button>
                                </div>
                            </>
                        )}
                    </Col>

                    {/* Right Side Map */}
                    <Col lg={6} className="mb-4 tt-itinerary-map-col">
                        <div>
                            <OverlayTrigger placement="bottom" trigger={["hover", "focus"]} overlay={builderHelp}>
                                <button type="button" className="tt-help-trigger" aria-label="How to build a trip">
                                    i
                                </button>
                            </OverlayTrigger>
                        </div>
                        <div className="tt-map-container tt-itinerary-map-sticky">
                            <MapView
                                showMarkers={itineraryMapLocations.length > 0}
                                mode="multiple"
                                locationsOverride={itineraryMapLocations}
                            />
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* Generate Trip Modal */}
            <TripModal
                show={showGenerateModal}
                onClose={() => setShowGenerateModal(false)}
                onGenerate={generateItinerary}
            />
        </div>
    );
}
