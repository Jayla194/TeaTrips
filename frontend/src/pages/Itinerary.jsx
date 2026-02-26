import MapView from "../components/MapView";
import TripDetails from "../components/Itinerary/TripDetails";
import HotelCard from "../components/Itinerary/HotelCard";

import { Container, Row, Col, Button } from "react-bootstrap";
import { useEffect, useState, useRef } from "react";
import { apiUrl } from "../utils/api";

export default function Itinerary() {
    const [itinerary, setItinerary] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [tripName, setTripName] = useState("Insert Name");

    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        async function fetchItinerary() {
            try {
                const res = await fetch(apiUrl("/api/itinerary/generate"), {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ city: "London", days: 2, stopsPerDay: 3 }),
                });

                if (!res.ok) {
                    const text = await res.text();
                    console.error("API error:", res.status, text);
                    throw new Error(`Request failed: ${res.status}`);
                }

                const data = await res.json();
                console.log("Itinerary response:", data);
                setItinerary(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load itinerary");
            }
        }

        fetchItinerary();
    }, []);

    if (error) {
        return <p>{error}</p>;
    }

    if (!itinerary) {
        return <p>Loading itinerary...</p>;
    }

    return (
        <div style={{ minHeight: "100vh" }}>
            <Container className="py-4">
                <Row>
                    <Col lg={6} className="mb-4">
                        <div className="tt-itinerary-builder">
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <h1 className="tt-title mb-0">Itinerary Builder</h1>
                                <Button className="tt-btn tt-btn-primary">Generate Trip</Button>
                            </div>
                            <TripDetails 
                                tripName={tripName}
                                setTripName={setTripName}
                                startDate={startDate}
                                setStartDate={setStartDate}
                                endDate={endDate}
                                setEndDate={setEndDate}
                                />
                            <HotelCard hotel={itinerary.hotel} />
                        </div>
                        {itinerary.days.map((day) => (
                            <div key={day.day}>
                                <h2>Day {day.day}</h2>

                                <ul>
                                    {day.stops.map((stop, index) => (
                                        <li key={index}>{stop.name || "Missing name"}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </Col>

                    {/* Right Side Map */}
                    <Col lg={6}>

                        <div className="tt-map-container sticky">
                            <MapView  showMarkers={false} mode="multiple" />
                        </div>
                    </Col>
                </Row>
            </Container>

            

        </div>
    );
}





