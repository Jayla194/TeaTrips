import { useMemo, useState, useEffect } from "react";
import { Card, Form } from "react-bootstrap";
import DatePicker from "react-datepicker";

function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export default function TripDetails({tripName,setTripName,startDate,setStartDate,endDate,setEndDate,dayCount=0}){
    const [collapsed, setCollapsed] = useState(false);

    const today = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return now;
    }, []);

    const maxBookingDate = useMemo(() => {
        const max = new Date(today);
        max.setFullYear(max.getFullYear() + 2);
        return max;
    }, [today]);

    const parseDate = (value) => {
        if (!value) return null;
        if (value instanceof Date) {
            return Number.isNaN(value.getTime()) ? null : value;
        }

        const raw = String(value).trim();
        if (!raw) return null;

        const parsed = raw.includes("T") ? new Date(raw) : new Date(`${raw}T00:00:00`);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    };
    const formatDate = (value) => {
        if (!(value instanceof Date)) return "";
        return Number.isNaN(value.getTime()) ? "" : formatLocalDate(value);
    };
    
    // Calculate Number of days
    const calculateDays = () => {
        if (!startDate || !endDate)return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000*60*60*24)) +1;
        return days > 0 ? days : 0;
    };

    // Auto-adjust end date when day count changes
    useEffect(() => {
        if (dayCount > 0 && startDate) {
            const start = new Date(startDate);
            const end = new Date(start);
            end.setDate(end.getDate() + (dayCount - 1));
            setEndDate(formatLocalDate(end));
        }
    }, [dayCount, startDate, setEndDate]);


    return(
        <Card className="tt-trip-details-card mb-4">
            <button
                className="tt-trip-details-header-btn"
                type="button"
                onClick={() => setCollapsed((prev) => !prev)}
                aria-expanded={!collapsed}
            >
                <div className="tt-trip-details-header-left">
                    <h3 className="tt-trip-details-title mb-0">Trip Details</h3>
                </div>
                <span className="tt-trip-details-chevron">{collapsed ? "+" : "-"}</span>
            </button>
            {!collapsed && (
                <Card.Body>
                    {/* Trip Name */}
                    <Form.Group className="mb-3">
                        <Form.Label>
                            <strong>Trip Name</strong>
                        </Form.Label>
                        <Form.Control type="text" value={tripName}
                            onChange={(e) => setTripName(e.target.value)}
                            className="tt-form-input"
                            placeholder="e.g. London City Break"/>
                    </Form.Group>

                    {/* Start and End Dates */}
                    <div className="tt-date-row">
                        <div className="tt-date-col">
                            <Form.Label className="tt-form-label">
                                <strong>Start Date</strong>
                            </Form.Label>
                            <DatePicker
                                selected={parseDate(startDate)}
                                onChange={(date) => setStartDate(formatDate(date))}
                                minDate={today}
                                maxDate={maxBookingDate}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Select date"
                                className="tt-form-input tt-date-input"
                                calendarClassName="tt-datepicker"
                                showPopperArrow={false}
                            />
                        </div>
                        <div className="tt-date-col">
                            <Form.Label className="tt-form-label">
                                <strong>End Date</strong>
                            </Form.Label>
                            <DatePicker
                                selected={parseDate(endDate)}
                                onChange={(date) => setEndDate(formatDate(date))}
                                minDate={parseDate(startDate) || today}
                                maxDate={maxBookingDate}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Select date"
                                className="tt-form-input tt-date-input"
                                calendarClassName="tt-datepicker"
                                showPopperArrow={false}
                            />
                        </div>
                        {/* Number of Days */}
                        <div className="tt-date-preview tt-date-preview-inline">
                            <span className="text-muted small">
                                {calculateDays()} {calculateDays() == 1 ? 'day' : 'days'}
                            </span>
                        </div>
                    </div>
                </Card.Body>
            )}
        </Card>
    );
}
