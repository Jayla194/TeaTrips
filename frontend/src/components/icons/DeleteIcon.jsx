export default function DeleteIcon({ className, title }) {
    const svg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
<path d="M8 6L9 4H15L16 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6 6L7 20H17L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10 10V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
<path d="M14 10V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>`;
    return (
        <span
            className={className}
            role={title ? "img" : "presentation"}
            aria-label={title || undefined}
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}
