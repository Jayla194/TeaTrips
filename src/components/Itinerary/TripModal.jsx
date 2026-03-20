import { Button, Form, Card } from "react-bootstrap";
import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { itineraryPreferences } from "../../utils/categoryMapping";
import { apiUrl } from "../../utils/api";
import DatePicker from "react-datepicker";

export default function TripModal({ show, onClose, onGenerate }) {
    const [formData, setFormData] = useState({
        city: "",
        startDate: "",
        endDate: "",
        budget: "any",
        interests: [],
        includeHotels: true,
        stopsPerDay: 3,
    });

    // Stores a list for the city autocomplete dropdown
    const [cityOptions, setCityOptions] = useState([]);

    const maxInterests = itineraryPreferences.maxSelectableInterests;
    const interestOptions = itineraryPreferences.interests;

    // Converts list to react-select format and sorts alphabetically
    const formattedCityOptions = useMemo(() => {
        return cityOptions
            .map((city) => String(city || "").trim())
            .filter(Boolean)
            .filter((city, index, arr) => arr.indexOf(city) === index)
            .sort((a, b) => a.localeCompare(b))
            .map((city) => ({ value: city, label: city }));
    }, [cityOptions]);

    useEffect(() => {
        if (!show) return;

        let isCancelled = false;

        async function fetchCities() {
            try {
                const res = await fetch(apiUrl("/api/locations/cities"), {
                    credentials: "include",
                });
                if (!res.ok) return;
                const cities = await res.json();
                if (!isCancelled && Array.isArray(cities)) {
                    setCityOptions(cities);
                }
            } catch (err) {
                console.error("Failed to load city suggestions:", err);
            }
        }

        fetchCities();

        return () => {
            isCancelled = true;
        };
    }, [show]);

    const handleInterestToggle = (interest) => {
        setFormData((prev) => {
            const exists = prev.interests.includes(interest);
            const next = exists
                ? prev.interests.filter((i) => i !== interest)
                : [...prev.interests, interest].slice(0, maxInterests);
            return { ...prev, interests: next };
        });
    };

    const handleGenerate = () => {
        if (typeof onGenerate === "function") {
            onGenerate(formData);
        }
        if (typeof onClose === "function") {
            onClose();
        }
    };

    const calculateDays = () => {
        if (!formData.startDate || !formData.endDate) return 0;
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    };

    const parseDate = (value) => (value ? new Date(`${value}T00:00:00`) : null);
    const formatDate = (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : "");

    if (!show) return null;

    return (
        <div className="tt-trip-overlay" onClick={onClose}>
            <div className="tt-trip-overlay-panel" onClick={(e) => e.stopPropagation()}>
                <Card className="tt-trip-details-card tt-trip-overlay-card">
                    <div className="tt-modal-header">
                        <div className="tt-modal-header-left">
                            <h3 className="tt-modal-title mb-0">Generate Your Perfect Trip</h3>
                        </div>
                        <Button
                            variant="tt-btn tt-btn"
                            size="sm"
                            onClick={onClose}
                            aria-label="Close trip settings"
                        >
                            Close
                        </Button>
                    </div>
                    <Card.Body className="tt-modal-body">

                        <Form.Group className="mb-3">
                            <Form.Label className="tt-form-label">City</Form.Label>
                            {/* Searchable City Dropdown */}
                            <Select
                                classNamePrefix="tt-city-select"
                                options={formattedCityOptions}
                                value={formattedCityOptions.find((option) => option.value === formData.city) || null}
                                onChange={(option) => setFormData({ ...formData, city: option?.value || "" })}
                                placeholder="Search cities..."
                                noOptionsMessage={() => "No matching cities"}
                                isClearable
                                isSearchable
                                
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="tt-form-label">When is your trip?</Form.Label>
                            <div className="tt-date-row">
                                <div className="tt-date-col">
                                    <DatePicker
                                        selected={parseDate(formData.startDate)}
                                        onChange={(date) =>
                                            setFormData({ ...formData, startDate: formatDate(date) })
                                        }
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="Select date"
                                        className="tt-form-input tt-date-input"
                                        calendarClassName="tt-datepicker"
                                        showPopperArrow={false}
                                    />
                                </div>
                                <div className="tt-date-col">
                                    <DatePicker
                                        selected={parseDate(formData.endDate)}
                                        onChange={(date) =>
                                            setFormData({ ...formData, endDate: formatDate(date) })
                                        }
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="Select date"
                                        className="tt-form-input tt-date-input"
                                        calendarClassName="tt-datepicker"
                                        showPopperArrow={false}
                                    />
                                </div>
                                <div className="tt-date-preview tt-date-preview-inline">
                                    <span className="text-muted small">
                                        {calculateDays() || 0} {calculateDays() === 1 ? "day" : "days"}
                                    </span>
                                </div>
                            </div>
                        </Form.Group>

                        <div className="tt-two-col-row mb-2">
                            <Form.Group>
                                <Form.Label className="tt-form-label">Budget</Form.Label>
                                <Form.Select
                                    className="tt-form-select"
                                    value={formData.budget}
                                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                >
                                    <option value="any">Any</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group>
                                <Form.Label className="tt-form-label">Pace</Form.Label>
                                <Form.Select
                                    className="tt-form-select"
                                    value={formData.stopsPerDay}
                                    onChange={(e) =>
                                        setFormData({ ...formData, stopsPerDay: Number.parseInt(e.target.value, 10) })
                                    }
                                >
                                    <option value={2}>Chill (2 locations)</option>
                                    <option value={3}>Average (3 locations)</option>
                                    <option value={4}>Packed (4 locations)</option>
                                </Form.Select>
                            </Form.Group>
                        </div>

                        <Form.Group className="mb-3">
                            <label className="tt-checkbox-label tt-inline-option d-flex align-items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.includeHotels}
                                    onChange={(e) =>
                                        setFormData({ ...formData, includeHotels: e.target.checked })
                                    }
                                />
                                <span>Include hotel recommendations</span>
                            </label>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="tt-form-label">
                                Interests <span className="text-muted small">(Select up to {maxInterests})</span>
                            </Form.Label>
                            <div className="tt-interests-grid">
                                {interestOptions.map((interest) => {
                                    const checked = formData.interests.includes(interest);
                                    const disabled = !checked && formData.interests.length >= maxInterests;
                                    return (
                                        <label
                                            key={interest}
                                            className={`tt-interest-checkbox ${checked ? "checked" : ""}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => handleInterestToggle(interest)}
                                                disabled={disabled}
                                            />
                                            <span>{interest}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </Form.Group>

                        

                        <div className="tt-modal-footer">
                            <Button variant="tt-btn tt-btn" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button className="tt-btn tt-btn-secondary" onClick={handleGenerate}>
                                Generate Trip
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
}

