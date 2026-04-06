import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import CategoryPills from "../components/CategoryPills";
import LocationCarousel from "../components/LocationCarousel";
import WarningBanner from "../components/WarningBanner";
import {
  getLondonAttractionsMostSaved,
  getHighlyRatedCheapLocations,
} from "../utils/exploreCarousels";
import { pillMatches } from "../utils/categoryMapping";
import LocationCard from "../components/LocationCard";
import { apiUrl } from "../utils/api";

import {
  AttractionIcon,
  FoodIcon,
  AccommodationIcon,
  NatureIcon,
  EntertainmentIcon,
} from "../components/icons";

// need icon for nature and entertainment
const CATEGORY_OPTIONS = [
  "Attractions",
  "Food & Drink",
  "Entertainment",
  "Nature & Outdoors",
  "Accommodation",
];
const CATEGORY_ICONS = {
  Attractions: AttractionIcon,
  "Food & Drink": FoodIcon,
  Accommodation: AccommodationIcon,
  Entertainment: EntertainmentIcon,
  "Nature & Outdoors": NatureIcon,
};

export default function Explore() {
  const [searchActive, setSearchActive] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [popularLocations, setPopularLocations] = useState([]);

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // similar locations
  const [savedLocations, setSavedLocations] = useState([]);
  const [similarForYou, setSimilarForYou] = useState(null);
  const [similarLocations, setSimilarLocations] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);

  const navigate = useNavigate();

  //fetch locations
  useEffect(() => {

    // use controller to cancel the fetch if the component stops before it completes
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(apiUrl("/api/locations"), {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to load locations");

        const data = await res.json();
        setLocations(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, []);

  // fetch popular locations for carousel
  useEffect(() => {
    let isCancelled = false;

    async function loadPopular() {
      try {
        const res = await fetch(apiUrl("/api/locations/popular"));
        if (!res.ok) throw new Error("Failed to load popular locations");
        const data = await res.json();
        if (!isCancelled) {
          setPopularLocations(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Error fetching popular locations:", err);
      }
    }
    loadPopular();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Loading saved Locations
  useEffect(() => {
    let isCancelled = false;
    async function loadSaved() {
      try {
        const res = await fetch(apiUrl("/api/saved"), {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load saved locations");
        const data = await res.json();
        if (!isCancelled) {
          setSavedLocations(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Error fetching saved locations:", err);
      }
    }
    loadSaved();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Picking a random location from saved locations to find similar
  useEffect(() => {
    if (savedLocations.length === 0) {
      setSimilarForYou(null);
      return;
    }
    const randomIndex = Math.floor(Math.random() * savedLocations.length);
    setSimilarForYou(savedLocations[randomIndex]);
  }, [savedLocations]);

  // Fetching similar locations based on the random saved location
  useEffect(() => {
    let isCancelled = false;
    async function loadSimilar() {
      if (!similarForYou) {
        setSimilarLocations([]);
        return;
      }
      try {
        setSimilarLoading(true);
        const res = await fetch(
          apiUrl(`/api/locations/${similarForYou.id}/similar?limit=10`),
        );
        if (!res.ok) throw new Error("Failed to load similar locations");
        const data = await res.json();
        if (!isCancelled) {
          setSimilarLocations(Array.isArray(data) ? data : []);
        }
        setSimilarLoading(false);
      } catch (err) {
        console.error("Error fetching similar locations:", err);
        setSimilarLoading(false);
      }
    }
    loadSimilar();
    return () => {
      isCancelled = true;
    };
  }, [similarForYou]);

  // carousel of most popular locations based on saved count
  const highlyRatedCheapLocations = useMemo(
    () => getHighlyRatedCheapLocations(popularLocations),
    [popularLocations],
  );

  // handles pill selection and toggling
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
  // filters locations based on search term and active category
  const filteredLocations = useMemo(() => {
    if (!searchActive) return [];

    const term = searchTerm.trim().toLowerCase();

    return locations
      .filter((loc) => {
        if (!activeCategory) return true;
        return pillMatches(loc.type, activeCategory);
      })
      .filter((loc) => {
        if (!term) return true;
        const name = String(loc.name || "").toLowerCase();
        const city = String(loc.city || "").toLowerCase();
        return name.includes(term) || city.includes(term);
      });
  }, [locations, activeCategory, searchTerm, searchActive]);

  // updates search params from the url
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    const urlCategory = searchParams.get("category");
    if (urlSearch) {
      setSearchTerm(urlSearch);
      setSearchActive(true);
    }
    if (urlCategory) {
      setActiveCategory(urlCategory);
      setSearchActive(true);
    }
  }, []);

  return (
    <div className="container py-4" style={{ minHeight: "100vh" }}>
      <header className="text-center mb-3">
        <h1 className="fw-bold-mb1 tt-title">Explore</h1>
        <p className="text-muted mb-3 tt-subtitle">
          Find places, save favourites, build your trips
        </p>

        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by place or city..."
          onSearch={() => {
            setSearchActive(true);
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (activeCategory) params.category = activeCategory;

            setSearchParams(params);
          }}
          onClear={() => {
            setSearchTerm("");
            setActiveCategory(null);
            setSearchActive(false);
            setSearchParams({});
          }}
        />

        <div className="mt-3">
          <CategoryPills
            options={CATEGORY_OPTIONS}
            active={activeCategory}
            onSelect={handleSelectCategory}
            icons={CATEGORY_ICONS}
          />
        </div>
      </header>

      {loading && (
        <p className="tt-empty-note text-center text-muted justify-content-center">
          <span className="tt-teabag-icon" aria-hidden="true"></span>
          Steeping locations...
        </p>
      )}
      {error && (
        <WarningBanner
          message={error}
          onClose={() => setError("")}
          variant="warning"
        />
      )}

      {!loading && !error && (
        <>
          {!searchActive ? (
            <>
              {/* Discovery */}
              {savedLocations.length > 0 && (
                <LocationCarousel
                  title={`Because you liked ${similarForYou?.name}`}
                  locations={similarLocations}
                  loading={similarLoading}
                  emptyMessage="Save locations to see similar recommendations here!"
                />
              )}
              <div className="tt-carousel-divider"></div>
              <LocationCarousel
                title="London Attractions"
                locations={getLondonAttractionsMostSaved(locations)}
              />
              <div className="tt-carousel-divider"></div>
              <LocationCarousel
                title="Popular Locations"
                // slice top 10 locations based on saved count for the carousel
                locations={popularLocations.slice(0, 10)}
              />

              <div className="tt-carousel-divider"></div>
              <LocationCarousel
                title="Highly Rated & Cheap"
                locations={highlyRatedCheapLocations}
              />
            </>
          ) : (
            <>
              {/*Searching */}
              <p className="text-muted mb-2">
                Showing <strong>{filteredLocations.length}</strong> result(s)
              </p>
              {filteredLocations.length === 0 && (
                <p className="tt-empty-note text-muted mb-3">
                  <span className="tt-teabag-icon" aria-hidden="true"></span>
                  No places found. Try a different search.
                </p>
              )}

              <div className="row g-3">
                {filteredLocations.map((loc) => (
                  <div className="col-12 col-sm-6 col-lg-4" key={loc.id}>
                    <LocationCard
                      location={loc}
                      onClick={() => navigate(`/locations/${loc.id}`)}
                    />
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
