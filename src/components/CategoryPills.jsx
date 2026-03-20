export default function CategoryPills({ options, active, onSelect, icons = {} }){
    return (
        <div className="d-flex gap-2 flex-wrap justify-content-center">
            {options.map((opt) => {
                const isActive = opt === active;
                const Icon = icons[opt];

                return(
                    <button
                    key = {opt}
                    type="button"
                    className={`tt-pill-btn ${isActive ? "active":""}`}
                    onClick={()=>onSelect(opt)}>
                        {Icon && (
                            <span className="tt-pill-icon">
                                <img src={Icon} alt="" />
                            </span>
                        )}
                        <span>{opt}</span>
                    </button>
                );
            })}
        </div>
    );
}