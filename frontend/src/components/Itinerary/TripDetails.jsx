import { Card, Form } from "react-bootstrap";

export default function TripDetails({tripName,setTripName,startDate,setStartDate,endDate,setEndDate}){
    
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
                <div className="row g-3 mb-3">
                    <div className="col-6">
                        <Form.Label className="tt-form-label">
                            <strong>Start Date</strong>
                        </Form.Label>
                        <Form.Control
                            type="date"
                            value={startDate}
                            onChange={(e)=> setStartDate(e.target.value)}
                            className="tt-form-input"
                            />
                    </div>
                    <div className="col-6">
                        <Form.Label className="tt-form-label">
                            <strong>End Date</strong>
                        </Form.Label>
                        <Form.Control
                            type="date"
                            value={endDate}
                            onChange={(e)=> setEndDate(e.target.value)}
                            className="tt-form-input"
                            />
                    </div>
                </div>
                {/* Number of Days */}
                <div className="tt-date-preview">
                    <span className="text-muted small">
                        {calculateDays()} {calculateDays() == 1 ? 'day' : 'days'}
                    </span>
                </div>
            </Card.Body>
        </Card>
    );
}