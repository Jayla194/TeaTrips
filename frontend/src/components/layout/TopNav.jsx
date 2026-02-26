import { useEffect, useState } from "react";
import { Container, Navbar, Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import logo from "../../assets/TeaTripsLogo.png";
import { apiUrl } from "../../utils/api";

export default function TopNav(){

    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const res = await fetch(apiUrl("/api/auth/user"),{
                    credentials:"include"
                });
                if (!res.ok){
                    setUser(null);
                    return;
                }
                const data = await res.json();
                setUser(data.user);
            }catch {
                setUser(null);
            } finally {
                setLoadingUser(false);
            }};
        loadUser();
    },[])

    const handleLogout = async () => {
        try {
            await fetch(apiUrl("/api/auth/logout"),{
                method:"POST",
                credentials:"include"
            });
        }finally {
            window.location.href = "/";
        }
    }
    const initial = user?.first_name?.[0]?.toUpperCase();

    return (
        <Navbar expand="md" className="tt-navbar" variant="light">
            <Container fluid className="px-4 px-lg-5">
                <Navbar.Brand
                as={NavLink}
                to="/"
                className="tt-brand d-flex align-items-center gap-2">
                    <img
                    src={logo}
                    alt="Tea Trips logo"
                    className="tt-nav-logo"/>
                    <span>Tea Trips</span>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="tt-nav" />
                <Navbar.Collapse id="tt-nav">
                    <Nav className="ms-auto align-items-md-center gap-md-4">
                        <Nav.Link as={NavLink} to="/explore" className="tt-navlink">
                        Explore
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/itinerary" className="tt-navlink">
                        Itinerary
                        </Nav.Link>
                        

                        <span className="tt-nav-divider d-none d-md-block" />
                        {/* Login and User Profile*/}

                        {!loadingUser && user ? (
                            <div className="d-flex align-items-center gap-2">
                                <Nav.Link as={NavLink} to="/profile" className="tt-navlink d-flex align-items-center gap-2">
                                    <span className="tt-avatar" title={user.first_name}>
                                        {initial}
                                    </span>
                                    <span>Profile</span>
                                </Nav.Link>
                                <Nav.Link type="button" className="tt-navlink tt-logout-btn" onClick={handleLogout}>
                                    Log Out
                                </Nav.Link>
                            </div>
                        ):(
                            <Nav.Link as={NavLink} to="/login" className="tt-navlink">
                                Log In
                            </Nav.Link>
                        )}

                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}
