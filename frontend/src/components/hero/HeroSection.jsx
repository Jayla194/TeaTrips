import { Container, Button, Stack } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function HeroSection({title,tagline,heroImageUrl,logoSrc,logoAlt}){

    const navigate = useNavigate();

    return(
        <section className="tt-hero"
        style={{["--tt-hero-img"]: `url(${heroImageUrl})`}}>
            <Container className="tt-hero-content">
                
                <div className="tt-hero-panel">
                    {logoSrc && (
                    <div className="tt-logo-badge">
                        <img src={logoSrc} alt={logoAlt} className="tt-logo" />
                    </div>
                    )}
                
                <h1 className="tt-hero-title display-6 mb-2">
                    {title}
                </h1>

                <p className="tt-hero-tagline mb-4">
                    {tagline}
                </p>

                <Stack
                direction="horizontal"
                gap={3}
                className="justify-content-center">
                    <Button className="tt-btn tt-btn-primary"
                    onClick={()=> navigate("/explore")}>
                        Explore
                    </Button>

                    <Button className="tt-btn tt-btn-primary"
                    onClick={()=> navigate("/register")}>
                        Sign Up
                    </Button>
                </Stack>
                </div>
            </Container>
        </section>
    );
}