import { useState } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";


function Login () {
    const backgroundImg = "https://images.unsplash.com/photo-1681407979872-0a4cbde28391?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";


    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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

            const res = await fetch("http://localhost:5000/api/auth/login",{
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
                            <div className="alert alert-danger py-2" role="alert">
                                {error}
                            </div>
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
                                            onChange={(e)=> setEmail(e.target.value)}/>
                                    </Form.Group>
                                </Col>
                            
                                <Col xs={12}>
                                    {/* Password */}
                                    <Form.Group>
                                        <Form.Label className="small fw-bold">Password
                                                <strong className="text-danger">*</strong>
                                            </Form.Label>
                                        <Form.Control type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e)=> setPassword(e.target.value)}/>
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