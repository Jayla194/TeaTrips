export default function WarningBanner({ message, onClose, variant = "warning", inline = false }) {
    if (!message) return null;

    const className = `tt-warning-banner alert alert-${variant} d-flex align-items-center gap-2 ${
        inline ? "tt-warning-banner-inline" : ""
    }`;

    return (
        <div className={className.trim()} role="alert">
            <div className="flex-grow-1">{message}</div>
            {onClose && (
                <button type="button"
                className="btn-close ms-auto"
                aria-label="Close"
                onClick={onClose}/>
            )}
        </div>
    );
}
