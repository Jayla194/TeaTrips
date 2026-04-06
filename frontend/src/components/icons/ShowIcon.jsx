export default function ShowIcon({ className, title }) {
    const svg = `<svg width="71" height="71" viewBox="0 0 71 71" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.83883 30.052C23.4835 15.4074 47.2272 15.4074 61.8718 30.052L67.1751 35.3553L61.8718 40.6586C47.2272 55.3033 23.4835 55.3033 8.83883 40.6586L3.53553 35.3553L8.83883 30.052Z" stroke="currentColor" stroke-width="5"/>
<circle cx="35.3553" cy="35.3553" r="7.5" stroke="currentColor" stroke-width="5"/>
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
