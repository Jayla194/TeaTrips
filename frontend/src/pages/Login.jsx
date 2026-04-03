import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, InputGroup } from "react-bootstrap";
import { apiUrl } from "../utils/api";
import WarningBanner from "../components/WarningBanner";
import ShowIcon from "../assets/Show.svg";
import HideIcon from "../assets/Hide.svg";


function Login () {
    const backgroundImg = "https://images.unsplash.com/photo-1681407979872-0a4cbde28391?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function checkLoggedIn() {
            try {
                const res = await fetch(apiUrl("/api/auth/user"), {
                    credentials: "include",
                });
                if (!res.ok) return;
                const data = await res.json();
                if (!cancelled && data?.user) {
                    navigate("/explore", { replace: true });
                }
            } catch {
                // ignore
            }
        }

        checkLoggedIn();
        return () => {
            cancelled = true;
        };
    }, [navigate]);

    // Login Function
    const login = async (e) => {
        e.preventDefault();
        setError("");
        

        // Validation
        if (!email || !password) {
            setError("Please fill out all fields")
            return;
        }
        try {
            setLoading(true)

            const res = await fetch(apiUrl("/api/auth/login"),{
                method:"POST",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email,password}),
            });
            
            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Login Failed");
                return;
            }
            window.location.href= "/explore";
        } catch (err){
            setError("Error please try again.");
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="tt-hero" style={{["--tt-hero-img"]: `url(${backgroundImg})`}}>
            <Container className="tt-form-wrap">
                <Card className="tt-form-card">
                    <Card.Body className="tt-form-body">
                        {/* Registration Header */}
                        <h2 className="tt-form-title">Login </h2>
                        <p className="tt-form-sub">Log In to save locations and itineraries.</p>
                        
                        {error && (
                            <WarningBanner
                                message={error}
                                onClose={() => setError("")}
                                variant="warning"
                            />
                        )}


                        <Form onSubmit={login}>
                            <Row>
                                <Col xs={12}>
                                    {/* Email */}
                                    <Form.Group>
                                        <Form.Label className="small fw-bold">Email <strong className="text-danger">*</strong></Form.Label>
                                        <Form.Control type="email"
                                            placeholder="JohnSmith@google.com"
                                            value={email}
                                            onChange={(e)=> setEmail(e.target.value)}
                                            className="tt-form-input"
                                            />
                                    </Form.Group>
                                </Col>
                            
                                <Col xs={12}>
                                    {/* Password */}
                                    <Form.Group>
                                        <Form.Label className="small fw-bold">Password
                                                <strong className="text-danger">*</strong>
                                            </Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                className="tt-password-input tt-form-input"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e)=> setPassword(e.target.value)}
                                            />
                                            <Button
                                                type="button"
                                                className="tt-password-toggle-btn"
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                                onClick={() => setShowPassword((prev) => !prev)}
                                            >
                                                <img
                                                    className="tt-password-toggle-icon"
                                                    src={showPassword ? HideIcon : ShowIcon}
                                                    alt={showPassword ? "Hide password" : "Show password"}
                                                />
                                            </Button>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="tt-form-footer">
                                <Button className="fw-bold tt-login-btn px-4"
                                type="submit"
                                disabled={loading}>
                                    {loading ? "Logging In...." : "Log In"}
                                </Button>

                                <div className="text-center mt-3">
                                    <small className="text-muted">
                                        Don't have an account?{" "}
                                        <a href="/register" >
                                        Register Here</a>
                                    </small>
                                </div>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
                
            </Container>
        </div>
    )




}
export default Login;
