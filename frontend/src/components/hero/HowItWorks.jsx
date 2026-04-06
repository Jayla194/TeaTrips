import { ExploreIcon, SaveIcon, AddIcon } from "../icons";

export default function HowItWorks(){
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
        <section className="tt-how-section">
            <div className="container">
                <div className="tt-header">
                    <h2 className="tt-title">How TeaTrips Works</h2>
                    <p className="tt-subtitle">Planning your UK adventure is as simple as brewing a cup of tea
                    </p>
                </div>

                <div className="tt-how-grid">
                    {steps.map((step, index) => (
                        <div className="tt-how-card"key={step.title}>
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
