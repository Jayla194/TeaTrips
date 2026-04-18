import { useEffect, useRef } from "react";
import { ExploreIcon, SaveIcon, AddIcon } from "../icons";

export default function HowItWorks(){
    const sectionRef = useRef(null);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const cards = section.querySelectorAll("[data-scroll-reveal]");
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.2 }
        );

        cards.forEach((card) => observer.observe(card));

        return () => observer.disconnect();
    }, []);

    const steps = [
        {
            Icon: ExploreIcon,
            title:"Browse & Discover",
            description:"Explore 350+ UK locations by city, category or budget."
        },{
            Icon: SaveIcon,
            title:"Save Your Favourites",
            description:"Build your travel list as you browse through destinations."
        },{
            Icon: AddIcon,
            title:"Generate Itineraries",
            description:"Get a personalised day-by-day plan in seconds"
        }
    ];

    return (
        <section className="tt-how-section" ref={sectionRef}>
            <div className="container">
                <div className="tt-header">
                    <h2 className="tt-title">How TeaTrips Works</h2>
                    <p className="tt-subtitle">Planning your UK adventure is as simple as brewing a cup of tea
                    </p>
                </div>

                <div className="tt-how-grid">
                    {steps.map((step, index) => (
                        <div
                            className="tt-how-card tt-scroll-reveal"
                            key={step.title}
                            data-scroll-reveal
                            style={{ "--tt-reveal-delay": `${index * 120}ms` }}
                        >
                            <div className="tt-how-number" >{index + 1}</div>
                            
                            <div className="tt-how-icon-wrap">
                                <step.Icon className="tt-how-icon" title={step.title} />
                            </div>
                            
                            <h3 className="tt-how-card-title">{step.title}</h3>
                            <p className="tt-how-card-desc">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
