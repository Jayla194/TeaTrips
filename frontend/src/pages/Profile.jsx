import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect} from "react";
import LocationCard from "../components/LocationCard";

export default function Profile(){
    
    const [user,setUser] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [savedLocations, setSavedLocations] = useState([]);
    const [visible, setVisible] = useState(6);

    const navigate = useNavigate();

    useEffect(()=> {
        async function loadUser(){
            try{
                const res = await fetch("http://localhost:5000/api/auth/user",{
                    credentials:"include"
                });

                if(!res.ok){
                    setUser(null);
                    return;
                }
                const data = await res.json();
                setUser(data.user);
            }catch {
                setUser(null);
            } finally{
                setLoading(false)};
        }
        loadUser();
    }, []);

    useEffect (()=>{
        async function loadSaved(){
            try{
                setLoading(true);
                setError("");

                const res = await fetch("http://localhost:5000/api/saved",{
                    credentials:"include"
                });

                if(!res.ok){
                    setError("Failed to load saved locations");
                }
                const data = await res.json();
                setSavedLocations(data);
            }catch(err){
                setError(err.message);
            }finally{
                setLoading(false);
            }
        } loadSaved();
    },[]);

    // Loading page while user and saved locations are fetched
    if(loading){
        return <div className="container py-4" style={{minHeight:"100vh"}}>Loading...</div>;
    }

    // Returns when user isn't logged in
    if (!user){
        return (
            <div className="container py-4" style={{minHeight:"100vh"}}>
                <div>
                    Please log in to view your profile<br/> <a href="/login">Log in</a>
                </div>
            </div>
        );
    }

    const initial = user?.first_name?.[0]?.toUpperCase();
    const visibleLocations = savedLocations.slice(0,visible);

    return (
    <div className="container py-4" style={{ minHeight: "100vh" }}>
        <div className="row g-5">

            {/* Left Side - Profile (30%) */}
            <div className="col-12 col-lg-4">
                <div className="tt-profile-card p-4">
                    <br/>
                    <div className="text-center mb-3">
                        <span className="tt-profile-avatar" title={user.first_name}>
                            {initial}
                        </span>
                    </div>
                    <br/>
                    <div className="tt-profile-info">
                        <h4 className="mb-4 tt-label">Profile</h4> <hr/>
                        <p className="tt-label">FULL NAME</p>
                        <p className="tt-value">{user.first_name} {user.last_name}</p>
                        </div>

                        <div className="tt-profile-info">
                        <p className="tt-label">EMAIL</p>
                        <p className="tt-value">{user.email}</p>
                    </div>
                </div>
            </div>

            {/* Right Side (70%) */}
            <div className="col-12 col-lg-8">
                <div className="row g-4">

                    {/* Saved Locations */}
                    <div className="col-12">
                        <div className="tt-loc-card p-4">
                            <h5 className="mb-3">Saved Locations</h5>
                            <hr />

                            {savedLocations.length === 0 && (
                                <p className="opacity-75 mb-0">
                                    You haven’t saved any locations yet.
                                </p>
                            )}
                            <div className="row g-3">
                                {visibleLocations.map((loc)=>(
                                    <div key={loc.id} className="col-12 col-md-6 col-xl-4">
                                        <LocationCard location={loc} onClick={()=> navigate(`/locations/${loc.id}`)}/>
                                    </div>
                                ))}

                                {visible < savedLocations.length && (
                                    <a className="mt-3 tt-navlink" style={{color:"#372416"}} onClick={()=> setVisible(prev => prev + 6)}>
                                        Load More
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Saved Itineraries */}
                    <div className="col-12">
                        <div className="tt-loc-card p-4">
                            <h5 className="mb-3">Saved Itineraries</h5>
                            <hr />
                            <p className="opacity-75 mb-0">Coming Soon...</p>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    </div>
);
}
