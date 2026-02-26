require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");


// Import Routes
const authRoutes = require("./routes/authRoutes");
const locationRoutes = require("./routes/locationRoutes");
const itineraryRoutes = require("./routes/itineraryRoutes")
const savedRoutes = require("./routes/savedRoutes");

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true}));


// Use Routes
app.use("/api/auth",authRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/itinerary", itineraryRoutes);
app.use("/api/saved",savedRoutes);

app.get("/api/ping", (req, res) => {
    res.json({ message: "Backend is running" });
});

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});



