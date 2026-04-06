export default function DarkMode({ className, title }) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M18.4 3.1c-3.1 1.2-5.1 3.9-5.1 7c0 3.9 3.1 7 7 7c1.6 0 3.1-.5 4.3-1.4c-1.3 3.8-5 6.4-9.2 6.4c-5.4 0-9.8-4.4-9.8-9.8c0-5 3.6-9.1 8.4-9.7c1.1-.1 2.2 0 3.4.5z" fill="currentColor"/>
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
