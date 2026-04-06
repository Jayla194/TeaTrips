export default function EntertainmentIcon({ className, title }) {
    const svg = `<svg width="40" height="35" viewBox="0 0 40 35" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="6.66667" cy="27.3333" r="6.16667" fill="currentColor" stroke="currentColor"/>
<circle cx="33.3334" cy="28" r="6.16667" fill="currentColor" stroke="currentColor"/>
<line x1="10.8333" y1="28" x2="10.8333" y2="1.33333" stroke="currentColor" stroke-width="5"/>
<line x1="37.5" y1="27.5" x2="37.5" y2="5.83333" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
<rect x="8.5" y="0.5" width="31" height="7" rx="1.5" fill="currentColor" stroke="currentColor"/>
</svg>
`;
    return (
        <span
            className={className}
            role={title ? "img" : "presentation"}
            aria-label={title || undefined}
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}
