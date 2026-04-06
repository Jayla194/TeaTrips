export default function OverviewIcon({ className, title }) {
    const svg = `<svg width="43" height="51" viewBox="0 0 43 51" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="20" height="20" rx="5" fill="currentColor"/>
<rect y="23" width="20" height="28" rx="5" fill="currentColor"/>
<rect x="23" width="20" height="40" rx="5" fill="currentColor"/>
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
