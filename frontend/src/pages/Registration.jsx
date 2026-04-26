import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Form, Button, OverlayTrigger, Tooltip, InputGroup } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { apiUrl } from "../utils/api";
import WarningBanner from "../components/WarningBanner";
import { ShowIcon, HideIcon } from "../components/icons";


function Register() {
    const backgroundImg = "https://images.unsplash.com/photo-1681407979872-0a4cbde28391?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
    const NAME_MAX_LENGTH = 50;
    const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\p{Zs}'’.-]*$/u;

    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [cookieConsent, setCookieConsent] = useState(false);

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
                
            }
        }

        checkLoggedIn();
        return () => {
            cancelled = true;
        };
    }, [navigate]);

    // ToolTip Placeholder
    const InfoHint = ({ text }) => {
        return (
            <OverlayTrigger
            placement="right"
            overlay={<Tooltip id="password-tooltip">{text}</Tooltip>}
            >
            <button
                type="button"
                className="tt-info-btn"
                aria-label="Password requirements"
            >
                ⓘ
            </button>
            </OverlayTrigger>
        );
        };
    
    // Registration Function
    const registration = async (e) => {
        e.preventDefault();
        setError("");

        const normalizedFirstName = firstName.trim();
        const normalizedLastName = lastName.trim();

        function validateName(label, value) {
            if (!value) {
                return `${label} is required`;
            }
            if (value.length > NAME_MAX_LENGTH) {
                return `${label} must be ${NAME_MAX_LENGTH} characters or fewer`;
            }
            if (!NAME_PATTERN.test(value)) {
                return `${label} can only include letters, spaces, apostrophes, hyphens, and periods`;
            }
            return "";
        }
        
        // Validation
        if (!normalizedFirstName || !normalizedLastName || !email || !password || !confirmPassword){
            setError("Please fill out all fields");
            return;
        }
        const firstNameError = validateName("First name", normalizedFirstName);
        if (firstNameError) {
            setError(firstNameError);
            return;
        }
        const lastNameError = validateName("Last name", normalizedLastName);
        if (lastNameError) {
            setError(lastNameError);
            return;
        }
        if (password !== confirmPassword){
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)){
            setError("Password isn't strong enough.")
            return;
        }
        if (!cookieConsent) {
            setError("Please agree to TeaTrips using an essential cookie to keep you signed in.");
            return;
        }

        try{
            setLoading(true);

            const res = await fetch(apiUrl("/api/auth/register"),{
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials:"include",
                body: JSON.stringify({
                    first_name: normalizedFirstName,
                    last_name: normalizedLastName,
                    email,
                    password,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Registration failed");
                return;
            }
            window.location.href="/explore";

        } catch (err) {
            setError("Server Error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="tt-hero"style={{
            ["--tt-hero-img"]: `url(${backgroundImg})`
            }}>
                
            <Container className="tt-form-wrap">
                <Card className="tt-form-card">
                    <Card.Body className="tt-form-body">
                        {/* Registration Header */}
                        <h2 className="tt-form-title">Register </h2>
                        <p className="tt-form-sub">Create an account ot save locations and itineraries.</p>
                        
                        {error && (
                        <div id="form-error">
                            <WarningBanner
                            message={error}
                            onClose={() => setError("")}
                            variant="warning"
                            role="alert"
                            />
                        </div>
                        )}


                        <Form onSubmit={registration}>
                            <Row className="g-3">
                                {/* First Name */}
                                <Col md={6}>
                                    <Form.Group controlId="firstName">
                                        <Form.Label className="small fw-bold"> First Name <strong className="text-danger">*</strong></Form.Label>
                                        <Form.Control type="text"
                                            autoComplete="given-name"
                                            placeholder="John"
                                            value={firstName}
                                            onChange = {(e)=> setFirstName(e.target.value)}
                                            className="tt-form-input"
                                            aria-describedby={error ? "form-error" : undefined}
                                            />
                                    </Form.Group>
                                </Col>

                                {/* Last Name */}
                                <Col md={6}>
                                    <Form.Group controlId="lastName">
                                        <Form.Label className="small fw-bold">Last Name <strong className="text-danger">*</strong></Form.Label>
                                            <Form.Control type="text"
                                            autoComplete="family-name"
                                            placeholder="Smith"
                                            value={lastName}
                                            onChange = {(e)=> setLastName(e.target.value)}
                                            className="tt-form-input"
                                            aria-describedby={error ? "form-error" : undefined}
                                            />
                                    </Form.Group>
                                </Col>
                            
                                <Col xs={12}>
                                    {/* Email */}
                                    <Form.Group controlId="email">
                                        <Form.Label className="small fw-bold">Email <strong className="text-danger">*</strong></Form.Label>
                                        <Form.Control type="email"
                                            autoComplete="email"
                                            placeholder="JohnSmith@google.com"
                                            value={email}
                                            onChange={(e)=> setEmail(e.target.value)}
                                            className="tt-form-input"
                                            aria-describedby={error ? "form-error" : undefined}
                                            />
                                    </Form.Group>
                                </Col>
                            
                                <Col xs={12}>
                                    {/* Password */}
                                    <Form.Group controlId="password">
                                        <Form.Label className="small fw-bold">Password
                                                <strong className="text-danger">*</strong>
                                                <InfoHint text="Must contain at least 8 Characters, 1 Uppercase, 1 Number."/>
                                            </Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                className="tt-password-input tt-form-input"
                                                autoComplete="new-password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e)=> setPassword(e.target.value)}
                                                aria-describedby={error ? "form-error" : undefined}
                                            />
                                            <Button
                                                type="button"
                                                className="tt-password-toggle-btn"
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                                onClick={() => setShowPassword((prev) => !prev)}
                                            >
                                                {showPassword ? (
                                                    <HideIcon className="tt-password-toggle-icon" title="Hide password" />
                                                ) : (
                                                    <ShowIcon className="tt-password-toggle-icon" title="Show password" />
                                                )}
                                            </Button>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                            
                                <Col xs={12}>
                                    {/* Confirm Password */}
                                    <Form.Group>
                                        <Form.Label className="small fw-bold">Confirm Password <strong className="text-danger">*</strong></Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                className="tt-password-input tt-form-input"
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={confirmPassword}
                                                onChange={(e)=> setConfirmPassword(e.target.value)}
                                            />
                                            <Button
                                                type="button"
                                                className="tt-password-toggle-btn"
                                                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                            >
                                                {showPassword ? (
                                                    <HideIcon className="tt-password-toggle-icon" title="Hide password" />
                                                ) : (
                                                    <ShowIcon className="tt-password-toggle-icon" title="Show password" />
                                                )}

                                            </Button>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <label className="tt-inline-option tt-cookie-consent d-flex align-items-start gap-2 w-100 mb-0">
                                    <input
                                        type="checkbox"
                                        checked={cookieConsent}
                                        onChange={(e) => setCookieConsent(e.target.checked)}
                                    />
                                    <span className="small">
                                        I understand TeaTrips uses an essential cookie to keep me signed in and manage my account session.
                                    </span>
                                </label>
                            </Form.Group>

                            <div className="tt-form-footer">
                                <Button className="fw-bold tt-login-btn px-4"
                                type="submit"
                                disabled={loading}>
                                    {loading ? "Creating Account...." : "Create Account"}
                                </Button>

                                <div className="text-center mt-3">
                                    <small className="text-muted">
                                        Already registered?{" "}
                                        <Link to="/login">
                                            Log in Here
                                        </Link>
                                    </small>
                                </div>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
                
            </Container>
        </div>
        
    );

}

export default Register;
    
