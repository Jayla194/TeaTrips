import { BrowserRouter, Routes, Route } from "react-router-dom";
import TopNav from "./components/layout/TopNav";
import Footer from "./components/layout/Footer";

import Home from "./pages/Home";
import Register from "./pages/Registration";
import Login from "./pages/Login";
import Explore from "./pages/Explore";
import LocationDetails from "./pages/LocationDetails";
import Itinerary from "./pages/Itinerary";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
    {/* Accessibility feature to bypass the nav bar and skip to main content for keyboard and screen readers */}
      <a href="#main" className="skip-link">Skip to content</a>

      <TopNav />

      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/locations/:id" element={<LocationDetails />} />
          <Route path="/itinerary" element={<Itinerary />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
