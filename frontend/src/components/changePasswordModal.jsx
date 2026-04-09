import {useState, useEffect} from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { ShowIcon,HideIcon } from "./icons";
import WarningBanner from "./WarningBanner";

export default function changePasswordModal(
    isOpen,
    onClose,
    onSubmit,
    currentPassword,
    newPassword,
    userId,
){

    const [current, setCurrent] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState("");
    

    const heading = "Change Password";
    const subheading = "Ensure your account is secure by using a strong password that you don't use elsewhere.";
    
    useEffect(() => {
        if (isOpen) {
            setCurrent("");
            setNewPass("");
            setConfirmPass("");
        }
    }, [isOpen]);

    function handleSubmit(e) {

        e.preventDefault();
        if (!current || !newPass || !confirmPass) {
            setError("All fields are required");
            return;
        }
        if (newPass !== confirmPass) {
            setError("New password and confirmation do not match");
            return;
        }
        if (newPass.length < 8) {
            setError("New password must be at least 8 characters long");
            return;
        }
        onSubmit({ currentPassword: current, newPassword: newPass, userId });

    }
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
                    <WarningBanner
                    message={error}
                    onClose={() => setError("")}
                    variant="warning"
                    />
                )}
                <form onSubmit={handleSubmit} className="tt-modal-body">
                    <label className="tt-field">
                        <span className="tt-field-label">Current Password</span>
                        <input
                            type="password"
                            className="tt-field-input"
                            value={current}
                            onChange={e => setCurrent(e.target.value)}
                            placeholder="Enter your current password"
                        />
                    </label>
                    <label className="tt-field">
                        <span className="tt-field-label">New Password</span>
                        <input
                            type="password"
                            className="tt-field-input"
                            value={newPass}
                            onChange={e => setNewPass(e.target.value)}
                            placeholder="Enter your new password"
                        />
                    </label>
                    <label className="tt-field">
                        <span className="tt-field-label">Confirm New Password</span>
                        <input
                            type="password"
                            className="tt-field-input"
                            value={confirmPass}
                            onChange={e => setConfirmPass(e.target.value)}
                            placeholder="Confirm your new password"
                        />
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