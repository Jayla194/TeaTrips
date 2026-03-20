import ExploreIcon from '../../assets/Explore.svg';
import SaveIcon from '../../assets/Save.svg';
import AddIcon from '../../assets/Add.svg';

export default function HowItWorks(){
    const steps = [
        {
            iconUrl:ExploreIcon,
            title:"Browse & Discover",
            description:"Explore 350+ UK locations by city, category or budget."
        },{
            iconUrl:SaveIcon,
            title:"Save Your Favourites",
            description:"Build your travel list as you browse through destinations."
        },{
            iconUrl:AddIcon,
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
                        <div className="tt-how-card">
                            <div className="tt-how-number">{index + 1}</div>
                            
                            <div className="tt-how-icon-wrap">
                                <img
                                    src={step.iconUrl}
                                    alt={step.title}
                                    className="tt-how-icon"
                                />
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