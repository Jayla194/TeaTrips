import { useNavigate } from "react-router-dom";
import { Container, Button, Stack } from "react-bootstrap";

export default function ClosingSection({ logoSrc, logoAlt }) {
    const navigate = useNavigate();

    return (
        <div className=" tt-closing-section">
            <Container>
                <div className="tt-header">

                    <h2 className="tt-title">Ready to plan your perfect UK trip?</h2>
                    <p className="tt-subtitle">
                        Browse 350+ handpicked locations or jump straight into
                        creating your personalised itinerary
                    </p>
                    {logoSrc && (
                        <div className="tt-logo-badge">
                            <img src={logoSrc} alt={logoAlt} className="tt-logo" />
                        </div>
                    )}
                </div>

                <Stack
                    direction="horizontal"
                    gap={3}
                    className="justify-content-center"
                >
                    <Button
                        className="tt-btn tt-btn-primary"
                        onClick={() => navigate("/explore")}
                    >
                        Explore Locations
                    </Button>

                    <Button
                        className="tt-btn tt-btn-secondary"
                        onClick={() => navigate("/itinerary")}
                    >
                        Build Itinerary
                    </Button>
                </Stack>
            </Container>
        </div>
    );
}