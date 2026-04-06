export default function SaveIcon({ className, title }) {
    const svg = `<svg width="40" height="49" viewBox="0 0 40 49" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M40 47.4015C40 48.2764 38.9559 48.7295 38.3169 48.1319L20.6831 31.6389C20.2987 31.2793 19.7013 31.2793 19.3169 31.6389L1.68309 48.1319C1.04413 48.7295 0 48.2764 0 47.4015V1C0 0.447716 0.447715 0 1 0H39C39.5523 0 40 0.447715 40 1V47.4015Z" fill="currentColor"/>
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
