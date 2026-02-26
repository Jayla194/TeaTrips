import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import CategoryPills from "../components/CategoryPills";
import LocationCarousel from "../components/LocationCarousel";
import { getLondonAttractionsAZ } from "../utils/exploreCarousels";
import { pillMatches } from "../utils/categoryMapping";
import LocationCard from "../components/LocationCard";

import AttractionsIcon from "../assets/Attraction.svg";
import FoodIcon  from "../assets/Food.svg";
import AccommodationIcon from "../assets/Accommodation.svg";
import NatureIcon from "../assets/Nature.svg";
import EntertainmentIcon from "../assets/Entertainment.svg";

// need icon for nature and entertainment
const CATEGORY_OPTIONS = [
    "Attractions",
    "Food & Drink",
    "Entertainment",
    "Nature & Outdoors",
    "Accommodation"
];
const CATEGORY_ICONS = {
    "Attractions": AttractionsIcon,
    "Food & Drink": FoodIcon,
    "Accommodation": AccommodationIcon,
    "Entertainment": EntertainmentIcon,
    "Nature & Outdoors": NatureIcon,
};


export default function Explore(){

    const [searchActive, setSearchActive] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchParams, setSearchParams] = useSearchParams();

    const [locations,setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,setError] = useState("");

    const navigate = useNavigate();

    //fetch locations
    useEffect(()=>{
        const controller = new AbortController();

        async function load(){
            try {
            setLoading(true);
            setError("");

            const res = await fetch("http://localhost:5000/api/locations", {
                signal : controller.signal,
            });
            if (!res.ok) throw new Error("Failed to load locations");

            const data = await res.json();
            setLocations(Array.isArray(data) ? data : []);

        } catch(err){
            if (err.name !== "AbortError"){
                setError(err.message || "Something went wrong");
            }
        } finally{
            setLoading(false);
        }
        }
        load();
        return () => controller.abort();
    }, []);


    const londonAttractions = useMemo(
        () => getLondonAttractionsAZ(locations),[locations]
    )

    const handleSelectCategory = (pill) => {
        const newCategory = activeCategory === pill ? null : pill;
        const hasSearchTerm = searchTerm.trim().length > 0;

        setActiveCategory(newCategory);
        setSearchActive(Boolean(newCategory || hasSearchTerm));
        const params = {};
        if (hasSearchTerm) params.search = searchTerm;
        if (newCategory) params.category = newCategory;
        setSearchParams(params);
    };

    const filteredLocations = useMemo(() => {
        if (!searchActive)  return [];

        const term = searchTerm.trim().toLowerCase();

        return locations.filter((loc) =>{
            if(!activeCategory) return true;
            return pillMatches(loc.type, activeCategory)
        })
        .filter((loc) => {
            if (!term) return true;
            const name = String(loc.name || "").toLowerCase();
            const city = String(loc.city || "").toLowerCase();
            return name.includes(term) || city.includes(term);
        });
    }, [locations, activeCategory, searchTerm, searchActive]);
    
    useEffect(() => {
        const urlSearch = searchParams.get("search");
        const urlCategory = searchParams.get("category");
        if (urlSearch){
            setSearchTerm(urlSearch);
            setSearchActive(true);
        }
        if (urlCategory){
            setActiveCategory(urlCategory);
            setSearchActive(true);
        }
    },[]);





    return (
        <div className="container py-4" style={{minHeight:"100vh"}}>
            <header className="text-center mb-3">
                <h1 className="fw-bold-mb1 tt-title">Explore</h1>
                <p className="text-muted mb-3 tt-subtitle" >Find places, save favourites, build your trips</p>

                <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search by place or city..."
                    onSearch={()=> {
                        setSearchActive(true);
                        const params = {};
                        if (searchTerm) params.search = searchTerm;
                        if (activeCategory) params.category = activeCategory;

                        setSearchParams(params);
                    }}

                    onClear={()=> {
                        setSearchTerm("");
                        setActiveCategory(null);
                        setSearchActive(false);
                        setSearchParams({});
                    }}/>

                <div className = "mt-3">
                    <CategoryPills
                        options={CATEGORY_OPTIONS}
                        active={activeCategory}
                        onSelect={handleSelectCategory}
                        icons={CATEGORY_ICONS}/>
                </div>
            </header>

            {loading && <p className="text-center text-muted">Loading Locations...</p>}
            {error && <p className="text-center text-danger">{error}</p>}

            {!loading && ! error && (
                <>
                {!searchActive ? (
                    <>
                    {/* Discovery */}
                    <LocationCarousel
                    title="London Attractions"
                    locations={londonAttractions}
                    />
                    </>
                ): (
                    <>
                    {/*Searching */}
                    <p className="text-muted mb-2">
                        Showing <strong>{filteredLocations.length}</strong> result(s)
                    </p>

                    <div className="row g-3">
                        {filteredLocations.map((loc)=>(
                        <div className="col-12 col-sm-6 col-lg-4" key={loc.id}>
                        <LocationCard location={loc} onClick={()=>navigate(`/locations/${loc.id}`)}/>
                            </div>
                        ))}
                    </div>
                    </>
                )}
                </>
            )}
        </div>
    );
}
