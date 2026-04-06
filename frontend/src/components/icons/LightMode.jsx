
export default function LightMode({ className, title }) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="67" height="67" viewBox="0 0 67 67" fill="none">
<path d="M33 13.6046L47.1421 19.4624L53 33.6046L47.1421 47.7467L33 53.6046L18.8579 47.7467L13 33.6046L18.8579 19.4624L33 13.6046Z" fill="currentColor"/>
<path d="M20.0796 3.16963L30.7207 10.6206L18.9474 16.1106L20.0796 3.16963Z" fill="currentColor"/>
<path d="M47.2497 3.77422L48.3819 16.7152L36.6086 11.2252L47.2497 3.77422Z" fill="currentColor"/>
<path d="M64.0146 21.0064L55.6646 30.9576L51.2216 18.7506L64.0146 21.0064Z" fill="currentColor"/>
<path d="M2.56515 20.6523L15.3582 18.3965L10.9152 30.6035L2.56515 20.6523Z" fill="currentColor"/>
<path d="M2.56516 45.7826L10.9152 35.8314L15.3582 48.0383L2.56516 45.7826Z" fill="currentColor"/>
<path d="M63.6605 45.7826L50.8675 48.0383L55.3105 35.8313L63.6605 45.7826Z" fill="currentColor"/>
<path d="M46.178 63.2651L36.2268 54.9151L48.4338 50.4721L46.178 63.2651Z" fill="currentColor"/>
<path d="M21.0477 64.2651L18.7919 51.4721L30.9989 55.9151L21.0477 64.2651Z" fill="currentColor"/>
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
