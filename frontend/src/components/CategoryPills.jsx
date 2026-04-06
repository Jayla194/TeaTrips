export default function CategoryPills({ options, active, onSelect, icons = {} }){
    return (
        <div className="d-flex gap-2 flex-wrap justify-content-center">
            {options.map((opt) => {
                const isActive = opt === active;
                const Icon = icons[opt];
                const isIconSrc = typeof Icon === "string";

                const slug = String(opt).toLowerCase().replace(/[^a-z0-9]+/g, "-");
                return(
                    <button
                    key = {opt}
                    type="button"
                    className={`tt-pill-btn ${isActive ? "active":""}`}
                    onClick={()=>onSelect(opt)}>
                        {Icon && (
                            <span className={`tt-pill-icon tt-pill-icon-${slug}`}>
                                {isIconSrc ? <img src={Icon} alt="" /> : <Icon />}
                            </span>
                        )}
                        <span>{opt}</span>
                    </button>
                );
            })}
        </div>
    );
}
