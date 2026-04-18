import MapView from "../components/MapView";
import TripDetails from "../components/Itinerary/TripDetails";
import HotelCard from "../components/Itinerary/HotelCard";
import TripModal from "../components/Itinerary/TripModal";
import TripDay from "../components/Itinerary/TripDay";
import ShowInfoModal from "../components/Itinerary/ShowInfoModal";
import AddLocationModal from "../components/Itinerary/AddLocationModal";
import WarningBanner from "../components/WarningBanner";
import ConfirmModal from "../components/ConfirmModal";
import { SaveIcon } from "../components/icons";


import { Container, Row, Col, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
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

function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function normalizeDateInput(value) {
    if (!value) return "";
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? "" : formatLocalDate(value);
    }

    const raw = String(value).trim();
    if (!raw) return "";

    const parsed = raw.includes("T") ? new Date(raw) : new Date(`${raw}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? "" : formatLocalDate(parsed);
}

function inferCityFromItinerary(data) {
    const metaCity = String(data?.meta?.city || "").trim();
    if (metaCity) return metaCity;

    const hotelCity = String(data?.hotel?.city || "").trim();
    if (hotelCity) return hotelCity;

    if (Array.isArray(data?.days)) {
        for (const day of data.days) {
            if (!Array.isArray(day?.stops)) continue;
            const stopWithCity = day.stops.find((stop) => String(stop?.city || "").trim());
            if (stopWithCity) return String(stopWithCity.city).trim();
        }
    }

    return "";
}

function validateBookingWindow(startDate, endDate, options = {}) {
    const { allowPastDates = false } = options;

    if (!startDate || !endDate) {
        return { ok: false, message: "Please choose both a start and end date." };
    }

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return { ok: false, message: "Please choose valid dates." };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setFullYear(maxDate.getFullYear() + 2);

    if (!allowPastDates && start < today) {
        return { ok: false, message: "Start date cannot be in the past." };
    }
    if (end < start) {
        return { ok: false, message: "End date cannot be before start date." };
    }
    if (start > maxDate || end > maxDate) {
        return { ok: false, message: "Trips can only be booked up to 2 years in advance." };
    }

    return { ok: true };
}

function hasTripAlreadyHappened(startDate, endDate) {
    const reference = endDate || startDate;
    if (!reference) return false;
    const date = new Date(`${reference}T00:00:00`);
    if (Number.isNaN(date.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
}

export default function Itinerary() {
    const [itinerary, setItinerary] = useState(createBlankItinerary);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [saveMessage, setSaveMessage] = useState(null);
    const [saving, setSaving] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedStop, setSelectedStop] = useState(null);
    const [showStopModal, setShowStopModal] = useState(false);
    const [stopAnchor, setStopAnchor] = useState(null);
    const [showAddLocation, setShowAddLocation] = useState(false);
    const [addDayNumber, setAddDayNumber] = useState(null);
    const [addingHotel, setAddingHotel] = useState(false);
    const [allLocations, setAllLocations] = useState([]);
    const [locationsLoading, setLocationsLoading] = useState(false);
    const [locationsError, setLocationsError] = useState("");
    const [locationQuery, setLocationQuery] = useState("");
    const [suggestedLocations, setSuggestedLocations] = useState([]);
    const [suggestedLoading, setSuggestedLoading] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const [tripName, setTripName] = useState("");
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [activeItineraryId, setActiveItineraryId] = useState(null);
    const [originalTripDates, setOriginalTripDates] = useState({ startDate: "", endDate: "" });
    const [readOnlyPastTrip, setReadOnlyPastTrip] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editParam = searchParams.get("edit");

    useEffect(() => {
        let cancelled = false;

        async function loadAuthStatus() {
            try {
                const res = await fetch(apiUrl("/api/auth/user"), {
                    credentials: "include",
                });
                const data = await res.json().catch(() => ({}));
                if (!cancelled) {
                    setIsLoggedIn(Boolean(res.ok && data?.user));
                }
            } catch {
                if (!cancelled) {
                    setIsLoggedIn(false);
                }
            }
        }

        loadAuthStatus();
        return () => {
            cancelled = true;
        };
    }, []);

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
        setStartDate(normalizeDateInput(parsed.startDate));
        setEndDate(normalizeDateInput(parsed.endDate));
    }}, []);

    useEffect(() => {
        if (!editParam) return;

        const itineraryId = Number(editParam);
        if (!Number.isInteger(itineraryId)) {
            setError("Invalid itinerary selected for editing.");
            return;
        }

        let cancelled = false;
        async function loadItineraryForEdit() {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(apiUrl(`/api/itinerary/${itineraryId}`), {
                    credentials: "include",
                });

                if (!res.ok) {
                    if (res.status === 401) {
                        throw new Error("Please log in to edit itineraries.");
                    }
                    if (res.status === 404) {
                        throw new Error("Itinerary not found.");
                    }
                    throw new Error("Failed to load itinerary.");
                }

                const data = await res.json();
                if (cancelled) return;

                setItinerary(data.itinerary || createBlankItinerary());
                setTripName(data.tripName || "");
                const normalizedStartDate = normalizeDateInput(data.startDate);
                const normalizedEndDate = normalizeDateInput(data.endDate);
                setStartDate(normalizedStartDate);
                setEndDate(normalizedEndDate);
                setOriginalTripDates({
                    startDate: normalizedStartDate,
                    endDate: normalizedEndDate,
                });
                setReadOnlyPastTrip(hasTripAlreadyHappened(normalizedStartDate, normalizedEndDate));
                const loadedId = Number(data.itineraryId);
                setActiveItineraryId(Number.isInteger(loadedId) ? loadedId : itineraryId);
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Failed to load itinerary.");
                    setActiveItineraryId(null);
                    setOriginalTripDates({ startDate: "", endDate: "" });
                    setReadOnlyPastTrip(false);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadItineraryForEdit();
        return () => {
            cancelled = true;
        };
    }, [editParam]);

    useEffect(() => {
        if (!editParam) {
            setReadOnlyPastTrip(false);
        }
    }, [editParam]);

    useEffect(() => {
        if (!showAddLocation) return;
        if (allLocations.length > 0) return;

        const controller = new AbortController();
        let cancelled = false;

        async function loadLocations() {
            try {
                setLocationsLoading(true);
                setLocationsError("");
                const res = await fetch(apiUrl("/api/locations"), { signal: controller.signal });
                if (!res.ok) throw new Error("Failed to load locations");
                const data = await res.json();
                if (!cancelled) {
                    setAllLocations(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                if (!cancelled && err.name !== "AbortError") {
                    setLocationsError(err.message || "Failed to load locations");
                }
            } finally {
                if (!cancelled) setLocationsLoading(false);
            }
        }

        loadLocations();
        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [showAddLocation, allLocations.length]);

    useEffect(() => {
        if (!showAddLocation) return;
        setLocationQuery("");
    }, [showAddLocation, itinerary?.meta?.city]);

    const selectedDayStops = useMemo(() => {
        if (!addDayNumber || !Array.isArray(itinerary?.days)) return [];
        const day = itinerary.days.find((d) => d.day === addDayNumber);
        return Array.isArray(day?.stops) ? day.stops : [];
    }, [addDayNumber, itinerary?.days]);

    const suggestionSeedId = useMemo(() => {
        if (addingHotel) return null;
        if (Array.isArray(selectedDayStops) && selectedDayStops.length > 0) {
            return selectedDayStops[0]?.id ?? null;
        }
        return null;
    }, [addingHotel, selectedDayStops]);

    const suggestionCity = useMemo(() => {
        const city = String(itinerary?.meta?.city || itinerary?.hotel?.city || "").trim();
        return city;
    }, [itinerary?.meta?.city, itinerary?.hotel?.city]);

    const isHotelLocation = (loc) => {
        const type = String(loc?.type || "").trim().toLowerCase();
        const tags = String(loc?.tags || "").trim().toLowerCase();
        return type === "hotel" || tags.includes("hotel");
    };

    const citySuggestions = useMemo(() => {
        if (!suggestionCity || !Array.isArray(allLocations)) return [];
        return allLocations
            .filter(
                (loc) =>
                    String(loc?.city || "").trim().toLowerCase() === suggestionCity.toLowerCase() &&
                    !isHotelLocation(loc)
            )
            .sort((a, b) => Number(b?.avg_rating || 0) - Number(a?.avg_rating || 0))
            .slice(0, 6);
    }, [allLocations, suggestionCity]);

    const hotelSuggestions = useMemo(() => {
        if (!suggestionCity || !Array.isArray(allLocations)) return [];
        return allLocations
            .filter(
                (loc) =>
                    String(loc?.city || "").trim().toLowerCase() === suggestionCity.toLowerCase() &&
                    isHotelLocation(loc)
            )
            .sort((a, b) => Number(b?.avg_rating || 0) - Number(a?.avg_rating || 0))
            .slice(0, 6);
    }, [allLocations, suggestionCity]);

    useEffect(() => {
        if (!showAddLocation) return;
        if (!suggestionSeedId) {
            setSuggestedLocations(citySuggestions);
            setSuggestedLoading(false);
            return;
        }

        let cancelled = false;
        async function loadSuggestions() {
            try {
                setSuggestedLoading(true);
                const res = await fetch(
                    apiUrl(`/api/locations/${suggestionSeedId}/similar?limit=6`)
                );
                if (!res.ok) throw new Error("Failed to load suggestions");
                const data = await res.json();
                if (!cancelled) {
                    const list = Array.isArray(data) ? data : [];
                    const noHotels = list.filter((loc) => !isHotelLocation(loc));
                    const cityFiltered = suggestionCity
                        ? noHotels.filter(
                              (loc) =>
                                  String(loc?.city || "").trim().toLowerCase() ===
                                  suggestionCity.toLowerCase()
                          )
                        : noHotels;
                    setSuggestedLocations(cityFiltered.length > 0 ? cityFiltered : noHotels);
                }
            } catch (err) {
                if (!cancelled) setSuggestedLocations([]);
            } finally {
                if (!cancelled) setSuggestedLoading(false);
            }
        }

        loadSuggestions();
        return () => {
            cancelled = true;
        };
    }, [showAddLocation, suggestionSeedId, suggestionCity, citySuggestions]);



    function daysBetweenInclusive(startDate, endDate) {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    async function generateItinerary(formData) {
        if (readOnlyPastTrip) {
            setError("This trip has already happened and is view-only.");
            return false;
        }

        if (!formData?.city) {
            setError("Please choose a city.");
            return false;
        }

        const dateValidation = validateBookingWindow(formData.startDate, formData.endDate);
        if (!dateValidation.ok) {
            setError(dateValidation.message);
            return false;
        }

        const days = daysBetweenInclusive(formData.startDate, formData.endDate);
        if (days < 1) {
            setError("Please choose valid dates.");
            return false;
        }

        try {
            setItinerary(createBlankItinerary());
            setLoading(true);
            setError(null);
            await new Promise((resolve) => setTimeout(resolve, 3500));

            const res = await fetch(apiUrl("/api/itinerary/generate"), {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    city: formData.city,
                    days,
                    stopsPerDay: formData.stopsPerDay,
                    interests: Array.isArray(formData.interests) ? formData.interests : [],
                    includeHotels: formData.includeHotels,
                }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message || body?.error || `Request failed: ${res.status}`);
            }

            const data = await res.json();
            setItinerary(data);
            setStartDate(formData.startDate || "");
            setEndDate(formData.endDate || "");
            return true;
        } catch (err) {
            console.error(err);
            setError("Failed to generate itinerary.");
            return false;
        } finally {
            setLoading(false);
        }
    }

    async function handleSaveItinerary() {
        if (isLoggedIn === false) {
            setSaveError("Please log in to save itineraries.");
            return;
        }

        if (readOnlyPastTrip) {
            setSaveError("This trip has already happened and is view-only.");
            return;
        }

        const city = inferCityFromItinerary(itinerary);
        if (!tripName || !tripName.trim()) {
            setSaveError("Please enter a trip name before saving.");
            return;
        }
        if (!city) {
            setSaveError("Please choose a city before saving.");
            return;
        }
        if (!Array.isArray(itinerary?.days) || itinerary.days.length === 0) {
            setSaveError("Itinerary must contain at least one day.");
            return;
        }

        const isEditing = Number.isInteger(activeItineraryId);
        const unchangedLegacyDates =
            isEditing &&
            startDate === originalTripDates.startDate &&
            endDate === originalTripDates.endDate;

        const dateValidation = validateBookingWindow(startDate, endDate, {
            allowPastDates: unchangedLegacyDates,
        });
        if (!dateValidation.ok) {
            setSaveError(dateValidation.message);
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

            const method = isEditing ? "PUT" : "POST";
            const url = isEditing
                ? apiUrl(`/api/itinerary/${activeItineraryId}`)
                : apiUrl("/api/itinerary/save");

            const res = await fetch(url, {
                method,
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            let finalRes = res;
            if (isEditing && (res.status === 404 || res.status === 405)) {
                // Fallback for older backend instances that only expose POST /save.
                finalRes = await fetch(apiUrl("/api/itinerary/save"), {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }

            if (!finalRes.ok) {
                if (finalRes.status === 401) {
                    throw new Error("Please log in to save itineraries.");
                }
                const body = await finalRes.json().catch(() => null);
                throw new Error(body?.message || "Failed to save itinerary.");
            }

            const body = await finalRes.json().catch(() => ({}));
            const savedId = Number(body?.itinerary_id);
            if (Number.isInteger(savedId)) {
                setActiveItineraryId(savedId);
            }

            setSaveMessage(isEditing ? "Itinerary updated." : "Itinerary saved to your profile.");
        } catch (err) {
            setSaveError(err.message || "Failed to save itinerary.");
        } finally {
            setSaving(false);
        }
    }

    function handleAddDay() {
        if (readOnlyPastTrip) return;

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

    function handleClearItineraryConfirm() {
        if (readOnlyPastTrip) return;
        setItinerary(createBlankItinerary());
        setStartDate("");
        setEndDate("");
        setTripName("New Trip");
        setActiveItineraryId(null);
        setSaveMessage(null);
        setSaveError(null);
        setError(null);
        setReadOnlyPastTrip(false);
        setShowStopModal(false);
        setSelectedStop(null);
        setShowAddLocation(false);
        setAddDayNumber(null);
        setAddingHotel(false);
        sessionStorage.removeItem("cachedItinerary");
    }
    
    // Removes locations from the itinerary
    function handleRemoveStop(dayNumber, stopIndex) {
        if (readOnlyPastTrip) return;

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
        if (readOnlyPastTrip) return;

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

    function handleOpenAddLocation(dayNumber) {
        if (readOnlyPastTrip) return;

        setAddDayNumber(dayNumber);
        setAddingHotel(false);
        setShowAddLocation(true);
    }

    function handleCloseAddLocation() {
        setShowAddLocation(false);
        setAddDayNumber(null);
        setAddingHotel(false);
    }

    function handleOpenAddHotel() {
        if (readOnlyPastTrip) return;

        setAddDayNumber(null);
        setAddingHotel(true);
        setShowAddLocation(true);
    }

    function handleAddLocation(dayNumber, location) {
        if (readOnlyPastTrip) return;
        if (!location || !dayNumber) return;

        const stop = {
            id: location.id,
            name: location.name,
            type: location.type,
            lat: location.lat,
            lon: location.lon,
            avgRating: location.avg_rating,
            imageUrl: location.image_url,
        };

        setItinerary((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                days: prev.days.map((day) => {
                    if (day.day !== dayNumber) return day;
                    const existingStops = Array.isArray(day.stops) ? day.stops : [];
                    if (existingStops.some((s) => s?.id === stop.id)) return day;
                    return { ...day, stops: [...existingStops, stop] };
                }),
            };
        });
    }

    function handleRemoveLocation(dayNumber, location) {
        if (readOnlyPastTrip) return;
        if (!location || !dayNumber) return;
        const idToRemove = location.id;
        if (!idToRemove) return;

        setItinerary((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                days: prev.days.map((day) => {
                    if (day.day !== dayNumber) return day;
                    const existingStops = Array.isArray(day.stops) ? day.stops : [];
                    const nextStops = existingStops.filter((stop) => stop?.id !== idToRemove);
                    return { ...day, stops: nextStops };
                }),
            };
        });
    }

    function handleAddHotel(location) {
        if (readOnlyPastTrip) return;
        if (!location) return;
        setItinerary((prev) => ({
            ...prev,
            hotel: {
                id: location.id,
                name: location.name,
                type: location.type,
                lat: location.lat,
                lon: location.lon,
                avg_rating: location.avg_rating,
                image_url: location.image_url,
                address: location.address,
                city: location.city,
            },
        }));
        handleCloseAddLocation();
    }

    function handleRemoveHotel() {
        if (readOnlyPastTrip) return;
        setItinerary((prev) => ({ ...prev, hotel: null }));
    }
    function handleOpenStop(stop){
        setSelectedStop(stop);
        setStopAnchor(null);
        setShowStopModal(true);
    }

    function handleOpenStopFromMarker(stop, screenPoint){
        const preferLeft = screenPoint ? screenPoint.x > window.innerWidth * 0.6 : false;
        setSelectedStop(stop);
        setStopAnchor(screenPoint ? { ...screenPoint, preferLeft } : null);
        setShowStopModal(true);
    }

    function handleViewDetails(stop){
        cacheItinerary(itinerary);
        const locationId = stop?.locationId ?? stop?.id;
        navigate(`/locations/${locationId}`);
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

        const dayStops = itinerary.days.flatMap((day)=>{
            if(!Array.isArray(day?.stops)) return[];

            return day.stops.map((stop,stopIndex) => ({
                id:`${day.day}-${stopIndex}-${stop?.id??"stop"}`,
                locationId: stop?.id,
                name: stop?.name || `Day ${day.day} stop`,
                lat: stop?.lat,
                lon: stop.lon,
                day: day.day, // Used for colour coding markers for each day
            }));
        });

        const hotel = itinerary?.hotel;
        const hasHotelCoords =
            hotel &&
            Number.isFinite(Number(hotel.lat)) &&
            Number.isFinite(Number(hotel.lon));

        if (!hasHotelCoords) return dayStops;

        return [
            ...dayStops,
            {
                id: hotel.id,
                markerKey: `hotel-${hotel.id}`,
                locationId: hotel.id,
                name: hotel.name || "Hotel",
                lat: hotel.lat,
                lon: hotel.lon,
                markerColor: "#5b3d27",
                isHotel: true,
            },
        ];
    }, [itinerary]);

    const cityLabel = String(itinerary?.meta?.city || "").trim();
    const filteredLocations = useMemo(() => {
        if (!Array.isArray(allLocations)) return [];
        const term = locationQuery.trim().toLowerCase();

        const filtered = allLocations.filter((loc) => {
            if (!addingHotel && isHotelLocation(loc)) return false;
            if (!term) return true;
            const name = String(loc?.name || "").toLowerCase();
            const locCity = String(loc?.city || "").toLowerCase();
            return name.includes(term) || locCity.includes(term);
        });

        return filtered.slice(0, 30);
    }, [allLocations, locationQuery, addingHotel]);

    const filteredHotelLocations = useMemo(() => {
        if (!Array.isArray(allLocations)) return [];
        const term = locationQuery.trim().toLowerCase();
        const cityFilter = cityLabel ? cityLabel.toLowerCase() : "";

        const hotels = allLocations.filter((loc) => {
            if (!isHotelLocation(loc)) return false;
            if (cityFilter && String(loc?.city || "").trim().toLowerCase() !== cityFilter) return false;
            if (!term) return true;
            const name = String(loc?.name || "").toLowerCase();
            const locCity = String(loc?.city || "").toLowerCase();
            return name.includes(term) || locCity.includes(term);
        });

        return hotels.slice(0, 30);
    }, [allLocations, locationQuery, cityLabel]);

    return (
        <div className="tt-itinerary-page">
            <Container className="py-4">
                <Row className="tt-itinerary-layout">
                    <Col lg={7} xl={6} className="mb-4 tt-itinerary-left-col">
                        <div className="tt-itinerary-builder">
                            <div className="tt-itinerary-header d-flex align-items-center justify-content-between mb-4">
                                <div className="d-flex align-items-center gap-2">
                                    <h1 className="tt-title mb-0">Itinerary Builder</h1>
                                </div>
                                <div className="tt-itinerary-actions d-flex gap-2">
                                    <Button
                                        className="tt-btn tt-btn-secondary"
                                        onClick={handleSaveItinerary}
                                        disabled={saving || readOnlyPastTrip || isLoggedIn === false}
                                        title={isLoggedIn === false ? "Login to save" : "Save itinerary"}
                                    >
                                        <SaveIcon className="tt-save-icon" />
                                        {isLoggedIn === false ? "Login to save" : saving ? "Saving..." : "Save"}
                                    </Button>
                                    <Button
                                        className="tt-btn tt-btn-primary"
                                        disabled={loading || readOnlyPastTrip}
                                        onClick={() => setShowGenerateModal(true)}>
                                        Generate Trip
                                    </Button>
                                </div>
                            </div>
                            {readOnlyPastTrip && (
                                <WarningBanner
                                    message="This trip has already happened and is in view-only mode."
                                    variant="warning"
                                    inline
                                />
                            )}
                            {error && (
                                <WarningBanner
                                    message={error}
                                    onClose={() => setError(null)}
                                    variant="warning"
                                />
                            )}
                            {saveError && (
                                <WarningBanner
                                    message={saveError}
                                    onClose={() => setSaveError(null)}
                                    variant="warning"
                                    inline
                                />
                            )}
                            {saveMessage && (
                                <WarningBanner
                                    message={saveMessage}
                                    onClose={() => setSaveMessage(null)}
                                    variant="success"
                                    inline
                                />
                            )}

                            <TripDetails
                                tripName={tripName}
                                setTripName={setTripName}
                                startDate={startDate}
                                setStartDate={setStartDate}
                                endDate={endDate}
                                setEndDate={setEndDate}/>
                            {loading && (
                                <div className="tt-tea-progress mt-3">
                                <div className="tt-tea-progress-top">
                                        <div className="tt-tea-steam-wrap" aria-hidden="true">
                                            <div className="tt-tea-steam-bars">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                            <span className="tt-tea-cup-icon"></span>
                                        </div>
                                </div>
                                    <div className="tt-tea-progress-text">
                                        Brewing your results...
                                    </div>
                                    <div className="tt-tea-progress-track" aria-hidden="true">
                                        <div className="tt-tea-progress-fill"></div>
                                    </div>
                                </div>
                            )}
                            {itinerary?.hotel && (
                                <HotelCard
                                    hotel={itinerary.hotel}
                                    onViewDetails={handleOpenStop}
                                    onRemove={handleRemoveHotel}
                                    readOnly={readOnlyPastTrip}
                                />
                            )}
                            {!itinerary?.hotel && (
                                <div className="mb-4">
                                    <h4 className="tt-section-label">Suggested Hotel</h4>
                                    <div className="tt-hotel-card">
                                        <p className="mb-3 text-muted">
                                            No hotel added yet. Pick one from the hotel list.
                                        </p>
                                        {!readOnlyPastTrip && (
                                            <Button className="tt-btn tt-btn-primary" onClick={handleOpenAddHotel}>
                                                + Add Hotel
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {itinerary.days.length === 0 ? (
                            <div className="tt-day-card">
                                <div className="tt-day-body">
                                    <p className="tt-empty-note mb-3 text-muted">
                                        <span className="tt-teabag-icon" aria-hidden="true"></span>
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
                                        readOnly={readOnlyPastTrip}
                                        dayColour={getDayColour(day.day)}
                                        onRemoveStop={handleRemoveStop}
                                        onMoveStop={handleMoveStop}
                                        onAddStop={handleOpenAddLocation}
                                        onOpenStop={handleOpenStop}
                                    />
                                ))}
                                <ShowInfoModal
                                    isOpen={showStopModal}
                                    stop={selectedStop}
                                    anchor={stopAnchor}
                                    onClose={() => setShowStopModal(false)}
                                    onViewDetails={handleViewDetails}
                                />
                                <div className="mt-3">
                                    {!readOnlyPastTrip && (
                                        <div className="d-flex flex-wrap gap-2">
                                            <Button className="tt-btn tt-btn-primary" onClick={handleAddDay}>
                                                + Add Day
                                            </Button>
                                            <Button className="tt-btn tt-btn-secondary" onClick={() => setShowClearConfirm(true)}>
                                                Clear itinerary
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </Col>

                    {/* Right Side Map */}
                    <Col lg={5} xl={6} className="mb-4 tt-itinerary-map-col">
                        <div className="tt-itinerary-map-top">
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
                                onMarkerClick={handleOpenStopFromMarker}
                            />
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* Generate Trip Modal */}
            <TripModal
                isOpen={showGenerateModal}
                onClose={() => setShowGenerateModal(false)}
                onGenerate={generateItinerary}
                errorMessage={error}
                onClearError={() => setError(null)}
            />

            <AddLocationModal
                isOpen={showAddLocation}
                dayNumber={addDayNumber}
                title={addingHotel ? "Add Hotel" : undefined}
                suggestedLocations={addingHotel ? hotelSuggestions : suggestedLocations}
                suggestedLoading={addingHotel ? locationsLoading : suggestedLoading}
                locations={addingHotel ? filteredHotelLocations : filteredLocations}
                loading={locationsLoading}
                error={locationsError}
                onClearError={() => setLocationsError("")}
                query={locationQuery}
                onQueryChange={setLocationQuery}
                cityLabel={cityLabel}
                dayStops={addingHotel ? (itinerary?.hotel ? [itinerary.hotel] : []) : selectedDayStops}
                onAddLocation={(loc) =>
                    addingHotel ? handleAddHotel(loc) : handleAddLocation(addDayNumber, loc)
                }
                onRemoveLocation={(loc) =>
                    addingHotel ? handleRemoveHotel() : handleRemoveLocation(addDayNumber, loc)
                }
                onClose={handleCloseAddLocation}
            />
            <ConfirmModal
                isOpen={showClearConfirm}
                title="Clear itinerary"
                message="This will remove all days, locations, and the hotel from this itinerary."
                confirmLabel="Clear itinerary"
                cancelLabel="Keep itinerary"
                confirmClassName="tt-btn tt-btn-secondary"
                onCancel={() => setShowClearConfirm(false)}
                onConfirm={() => {
                    setShowClearConfirm(false);
                    handleClearItineraryConfirm();
                }}
            />
        </div>
    );
}
