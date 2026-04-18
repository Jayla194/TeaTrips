import {useState, useEffect, useRef} from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { ShowIcon, HideIcon } from "./icons";
import WarningBanner from "./WarningBanner";

export default function ChangePasswordModal({
    isOpen,
    onClose,
    onSubmit,
}){

    const [current, setCurrent] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState("");
    const errorRef = useRef(null);
    

    const heading = "Change Password";
    const subheading = "Ensure your account is secure by using a strong password that you don't use elsewhere.";
    const passwordHint = "Must contain at least 8 characters, 1 uppercase, 1 number.";
    
    useEffect(() => {
        if (isOpen) {
            setCurrent("");
            setNewPass("");
            setConfirmPass("");
            setShowCurrent(false);
            setShowNew(false);
            setShowConfirm(false);
            setError("");
            document.body.classList.add("tt-modal-open");
            document.body.style.overflow = "hidden";
        } else {
            document.body.classList.remove("tt-modal-open");
            document.body.style.overflow = "";
        }

        return () => {
            document.body.classList.remove("tt-modal-open");
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    useEffect(() => {
        if (error) {
            errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [error]);

    async function handleSubmit(e) {

        e.preventDefault();
        if (!current || !newPass || !confirmPass) {
            setError("All fields are required");
            return;
        }
        if (newPass !== confirmPass) {
            setError("New password and confirmation do not match");
            return;
        }
        if (newPass.length < 8 || !/[A-Z]/.test(newPass) || !/[0-9]/.test(newPass)) {
            setError("Password must be 8+ characters with 1 uppercase letter and 1 number");
            return;
        }
        try {
            const result = await onSubmit({ currentPassword: current, newPassword: newPass });
            if (result?.error) {
                setError(result.error);
            }
        } catch (err) {
            setError(err?.message || "Failed to change password");
        }

    }
    if (!isOpen) return null;

    const InfoHint = ({ text }) =>{
        return (
            <OverlayTrigger
            placement="right"
            overlay = {<Tooltip>{text}</Tooltip>}>
                <span style={{ cursor: "help", marginLeft: 8, opacity: 0.8 }}>ⓘ</span>
            </OverlayTrigger>
        )
    }

    return(
        <div className="tt-modal-backdrop">
            <div className="tt-modal">
                <div className="tt-modal-header">
                    <div className="tt-modal-header-left">
                        <h2 className="tt-modal-title">{heading}</h2>
                        <p className="tt-modal-subtitle">{subheading}</p>
                    </div>
                    <button className="tt-btn tt-btn-ghost" onClick={onClose} aria-label="Close">
                        x
                    </button>
                </div>
                {error && (
                    <div ref={errorRef}>
                        <WarningBanner
                            message={error}
                            onClose={() => setError("")}
                            variant="warning"
                        />
                    </div>
                )}
                <form onSubmit={handleSubmit} className="tt-modal-body">
                    <label className="tt-field">
                        <span className="tt-field-label">Current Password</span>
                        <div className="tt-password-group">
                            <input
                                type={showCurrent ? "text" : "password"}
                                className="tt-password-input tt-field-input"
                                value={current}
                                onChange={e => setCurrent(e.target.value)}
                                placeholder="Enter your current password"
                            />
                            <button
                                type="button"
                                className="tt-password-toggle-btn"
                                aria-label={showCurrent ? "Hide current password" : "Show current password"}
                                onClick={() => setShowCurrent((prev) => !prev)}
                            >
                                {showCurrent ? (
                                    <HideIcon className="tt-password-toggle-icon" title="Hide password" />
                                ) : (
                                    <ShowIcon className="tt-password-toggle-icon" title="Show password" />
                                )}
                            </button>
                        </div>
                    </label>
                    <label className="tt-field">
                        <span className="tt-field-label">
                            New Password
                            <InfoHint text={passwordHint} />
                        </span>
                        <div className="tt-password-group">
                            <input
                                type={showNew ? "text" : "password"}
                                className="tt-password-input tt-field-input"
                                value={newPass}
                                onChange={e => setNewPass(e.target.value)}
                                placeholder="Enter your new password"
                            />
                            <button
                                type="button"
                                className="tt-password-toggle-btn"
                                aria-label={showNew ? "Hide new password" : "Show new password"}
                                onClick={() => setShowNew((prev) => !prev)}
                            >
                                {showNew ? (
                                    <HideIcon className="tt-password-toggle-icon" title="Hide password" />
                                ) : (
                                    <ShowIcon className="tt-password-toggle-icon" title="Show password" />
                                )}
                            </button>
                        </div>
                    </label>
                    <label className="tt-field">
                        <span className="tt-field-label">Confirm New Password</span>
                        <div className="tt-password-group">
                            <input
                                type={showConfirm ? "text" : "password"}
                                className="tt-password-input tt-field-input"
                                value={confirmPass}
                                onChange={e => setConfirmPass(e.target.value)}
                                placeholder="Confirm your new password"
                            />
                            <button
                                type="button"
                                className="tt-password-toggle-btn"
                                aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                                onClick={() => setShowConfirm((prev) => !prev)}
                            >
                                {showConfirm ? (
                                    <HideIcon className="tt-password-toggle-icon" title="Hide password" />
                                ) : (
                                    <ShowIcon className="tt-password-toggle-icon" title="Show password" />
                                )}
                            </button>
                        </div>
                    </label>
                    <div className="tt-modal-footer">
                        <button type="button" className="tt-btn tt-btn-ghost" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="tt-btn tt-btn-primary">
                            Change Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
