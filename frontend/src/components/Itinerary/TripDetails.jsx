import { useState } from "react";
import { Card, Form } from "react-bootstrap";
import DatePicker from "react-datepicker";

export default function TripDetails({tripName,setTripName,startDate,setStartDate,endDate,setEndDate}){
    const [collapsed, setCollapsed] = useState(false);

    const parseDate = (value) => (value ? new Date(`${value}T00:00:00`) : null);
    const formatDate = (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : "");
    
    // Calculate Number of days
    const calculateDays = () => {
        if (!startDate || !endDate)return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000*60*60*24)) +1;
        return days > 0 ? days : 0;
    };


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
