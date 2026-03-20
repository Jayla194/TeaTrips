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
                    <h2 className="tt-title">Start with a Popular Region</h2>
                </div>

                <Row className="g-3 justify-content-center">
                    {regions.map((region)=>(
                        <Col key={region} xs={10} sm={6} md={4} lg={3}>
                            <div
                                className="tt-region-card"
                                role="button"
                                onClick={() => handleClick(region)}
                                >
                                    {region}
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
}