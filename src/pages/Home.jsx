import HeroSection from "../components/hero/HeroSection";
import RegionTiles from "../components/hero/RegionTiles";
import HowItWorks from "../components/hero/HowItWorks";
import ClosingSection from "../components/hero/ClosingSection";


const heroImg = "https://images.unsplash.com/photo-1681407979872-0a4cbde28391?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
import logo from "../assets/TeaTripsLogo.png";

export default function Home(){
    return (
        <div style={{minHeight:"100vh"}}>
            <HeroSection
            title = "TeaTrips"
            tagline = "Travel plans brewed to perfection"
            heroImageUrl = {heroImg}
            logoSrc={logo}
            logoAlt="Tea Trips Logo"
            />
            <HowItWorks />
            
            <RegionTiles regions={["London","Birmingham","Oxford"]} />

            <ClosingSection logoSrc={logo} logoAlt="Tea Trips Logo"/>
        </div>
    );
}