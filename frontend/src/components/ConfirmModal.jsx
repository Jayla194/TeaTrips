export default function ConfirmModal({
    isOpen,
    title = "Confirm action",
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    confirmClassName = "tt-btn tt-btn-primary",
    cancelClassName = "tt-btn tt-btn-ghost",
    className = "",
}) {
    if (!isOpen) return null;

    return (
        <div className="tt-modal-backdrop">
            <div className={`tt-modal tt-confirm-modal ${className}`.trim()}>
                <div className="tt-modal-header">
                    <div className="tt-modal-header-left">
                        <h2 className="tt-modal-title">{title}</h2>
                    </div>
                    <button className="tt-btn tt-btn-ghost" onClick={onCancel} aria-label="Close">
                        x
                    </button>
                </div>
                <div className="tt-modal-body">
                    {message && <p className="tt-confirm-message">{message}</p>}
                    <div className="tt-modal-footer">
                        <button type="button" className={cancelClassName} onClick={onCancel}>
                            {cancelLabel}
                        </button>
                        <button type="button" className={confirmClassName} onClick={onConfirm}>
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
