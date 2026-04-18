import { Container, Row, Col } from "react-bootstrap";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";


export default function RegionTiles({ regions }){
    
    const navigate = useNavigate();
    const sectionRef = useRef(null);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const cards = section.querySelectorAll("[data-scroll-reveal]");
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.2 }
        );

        cards.forEach((card) => observer.observe(card));

        return () => observer.disconnect();
    }, []);

    // Scrolls to top of page
    function topFunction() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }
    // Searches for destinations in specified location
    const handleClick = (region) => {
        navigate(`/explore?search=${region}`);
        topFunction();
    };

    return(
        <section className="tt-region-wrap" ref={sectionRef}>
            <Container>
                <div className="tt-header">
                    <h2 className="tt-title">Where do you want to explore?</h2>
                    <p className="tt-subtitle">Choose a region to start building your trip</p>
                </div>

                <Row className="g-3 justify-content-center">
                    {regions.map((region)=>(
                        <Col key={region} xs={10} sm={6} md={4} lg={3}>
                            <button
                                type="button"
                                className="tt-region-card tt-scroll-reveal"
                                onClick={() => handleClick(region)}
                                aria-label={`Explore destinations in ${region}`}
                                data-scroll-reveal
                                style={{ "--tt-reveal-delay": `${regions.indexOf(region) * 120}ms` }}
                                >
                                {region}
                            </button>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
}