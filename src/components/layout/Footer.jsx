import { Container } from "react-bootstrap";

export default function Footer(){
    return(
        <footer className="tt-footer">
            <Container>
                <div className="tt-footer-inner">
                
                {/* Left */}
                <div className="tt-footer-left">
                    <div className="tt-footer-brand">Tea Trips</div>
                    <div className="tt-footer-tagline">
                    Travel plans, brewed to perfection
                    </div>
                </div>

                {/* Middle */}
                <div className="tt-footer-links">
                    <a href="/explore">Explore ·</a>
                    <a href="/itinerary">Itinerary ·</a>
                    <a href="/profile">Profile </a>
                    
                </div>

                {/* Right */}
                <div className="tt-footer-right">
                    © {new Date().getFullYear()} · Final Year Project
                </div>

                </div>
            </Container>
        </footer>

    )
}