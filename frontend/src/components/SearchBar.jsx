import { SearchIcon } from "./icons";

export default function SearchBar ({ value, onChange, placeholder, onSearch, onClear }){
    
    const hasText = Boolean(value && value.trim().length > 0);
    
    return (
        <div className="d-flex justify-content-center">
            <div className="tt-search input-group" style={{maxWidth: 520}}>
                <input
                className="form-control tt-search-input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                aria-label="Search locations"
                onKeyDown={(e) => {
                    if (e.key === "Enter" && onSearch) onSearch();
                }}/>

                {/* Clear button (only shows when there's text) */}
                {onClear && (
                <button
                    type="button"
                    className="btn tt-search-clear"
                    onClick={onClear}
                    disabled={!hasText}
                    title="Clear"
                    aria-label="Clear"
                >
                    ✕
                </button>
                )}

                {/* Search Button */}
                <button
                    type="button"
                    className="input-group-text tt-search-icon"
                    onClick={() => onSearch && onSearch()}
                    title="Search"
                    aria-label="Search"
                    >
                    <SearchIcon className="tt-icon" title="Search" />
                </button>
            </div>
        </div>
    )
}
