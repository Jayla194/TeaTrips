import { useState } from "react";
import { Container, Row, Col, Card, Form, Button, OverlayTrigger, Tooltip } from "react-bootstrap";


function Register() {
    const backgroundImg = "https://images.unsplash.com/photo-1681407979872-0a4cbde28391?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // ToolTip Placeholder
    const InfoHint = ({ text }) =>{
        return (
            <OverlayTrigger
            placement="right"
            overlay = {<Tooltip>{text}</Tooltip>}>
                <span style={{ cursor: "help", marginLeft: 8, opacity: 0.8 }}>ⓘ</span>
            </OverlayTrigger>
        )
    }
    
    // Registration Function
    const registration = async (e) => {
        e.preventDefault();
        setError("");
        
        // Validation
        if (!firstName || !lastName || !email || !password || !confirmPassword){
            setError("Please fill out all fields");
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

        try{
            setLoading(true);

            const res = await fetch("http://localhost:5000/api/auth/register",{
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials:"include",
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
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
                            <div className="alert alert-danger py-2" role="alert">
                                {error}
                            </div>
                        )}


                        <Form onSubmit={registration}>
                            <Row className="g-3">
                                {/* First Name */}
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="small fw-bold"> First Name <strong className="text-danger">*</strong></Form.Label>
                                        <Form.Control type="text"
                                            placeholder="John"
                                            value={firstName}
                                            onChange = {(e)=> setFirstName(e.target.value)}/>
                                    </Form.Group>
                                </Col>

                                {/* Last Name */}
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="small fw-bold">Last Name <strong className="text-danger">*</strong></Form.Label>
                                            <Form.Control type="text"
                                            placeholder="Smith"
                                            value={lastName}
                                            onChange = {(e)=> setLastName(e.target.value)}/>
                                    </Form.Group>
                                </Col>
                            
                                <Col xs={12}>
                                    {/* Email */}
                                    <Form.Group>
                                        <Form.Label className="small fw-bold">Email <strong className="text-danger">*</strong></Form.Label>
                                        <Form.Control type="email"
                                            placeholder="JohnSmith@google.com"
                                            value={email}
                                            onChange={(e)=> setEmail(e.target.value)}/>
                                    </Form.Group>
                                </Col>
                            
                                <Col xs={12}>
                                    {/* Password */}
                                    <Form.Group>
                                        <Form.Label className="small fw-bold">Password
                                                <strong className="text-danger">*</strong>
                                                <InfoHint text="Must contain at least 8 Characters, 1 Uppercase, 1 Number."/>
                                            </Form.Label>
                                        <Form.Control type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e)=> setPassword(e.target.value)}/>
                                    </Form.Group>
                                </Col>
                            
                                <Col xs={12}>
                                    {/* Confirm Password */}
                                    <Form.Group>
                                        <Form.Label className="small fw-bold">Confirm Password <strong className="text-danger">*</strong></Form.Label>
                                        <Form.Control type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e)=> setConfirmPassword(e.target.value)}/>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <div className="tt-form-footer">
                                <Button className="fw-bold tt-login-btn px-4"
                                type="submit"
                                disabled={loading}>
                                    {loading ? "Creating Account...." : "Create Account"}
                                </Button>

                                <div className="text-center mt-3">
                                    <small className="text-muted">
                                        Already registered?{" "}
                                        <a href="/login" >
                                        Log in Here</a>
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
    