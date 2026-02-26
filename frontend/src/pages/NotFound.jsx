import { useNavigate } from "react-router-dom";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="container py-5 text-center" style={{minHeight:"100vh"}}>
            <h1 className="tt-404-code">404</h1>
            <h4 className="mb-3">This page doesn't exist</h4>
            <p className="opacity-75 mb-4">
                It looks like you’ve wandered somewhere unexpected.
                The page you're looking for might have been moved or might not exist existed.
            </p>
            <button className="tt-btn tt-btn-primary" onClick={()=> navigate("/")}>
                Go Home
            </button>
        </div>
    )
}