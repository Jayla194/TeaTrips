export default function WarningBanner({ message, onClose, variant = "warning"  }) {
    if (!message) return null;

    return (
        <div className={`tt-warning-banner alert alert-${variant} d-flex align-items-center gap-2`} role="alert">
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
