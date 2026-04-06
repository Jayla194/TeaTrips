export default function AddIcon({ className, title }) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
<circle cx="24" cy="24" r="19" fill="none" stroke="currentColor" stroke-width="5"/>
<line x1="24" y1="15.5" x2="24" y2="32.5" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
<line x1="15.5" y1="24" x2="32.5" y2="24" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
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
