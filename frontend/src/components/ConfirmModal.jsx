import {useEffect, useRef } from "react";

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
    const modalRef = useRef(null);
    const previouslyFocusedElement = useRef(null);

    // Focus management and scroll lock
    useEffect(() => {
        if (isOpen) {
            previouslyFocusedElement.current = document.activeElement;
            modalRef.current?.focus();
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
            previouslyFocusedElement.current?.focus();
        }
        return () => {
            document.body.style.overflow = "";
        };
        }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
    function handleKey(e) {
        if (e.key === "Escape") {
        onCancel();
    }}
    if (isOpen) {
        document.addEventListener("keydown", handleKey);
    }
    return () => {
        document.removeEventListener("keydown", handleKey);
    };
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        <div className="tt-modal-backdrop"
            onClick={onCancel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            >
            <div
                ref={modalRef}
                tabIndex={-1}
                onClick={(e) => e.stopPropagation()}
                className={`tt-modal tt-confirm-modal ${className}`.trim()}
                >
                <div className="tt-modal-header">
                    <div className="tt-modal-header-left">
                        <h2 id="modal-title" className="tt-modal-title">{title}</h2>
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
