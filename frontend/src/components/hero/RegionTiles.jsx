import { Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";


export default function RegionTiles({ regions }){
    
    const navigate = useNavigate();

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
        <section className="tt-region-wrap">
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
                                className="tt-region-card"
                                onClick={() => handleClick(region)}
                                aria-label={`Explore destinations in ${region}`}
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