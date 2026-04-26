import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const STORAGE_KEY = "tt_cookie_notice_dismissed";

export default function CookieNotice() {
    const [visible, setVisible] = useState(false);
    const { pathname } = useLocation();
    const isAuthRoute = pathname === "/login" || pathname === "/register";

    useEffect(() => {
        if (!isAuthRoute) {
            setVisible(false);
            return;
        }

        setVisible(window.localStorage.getItem(STORAGE_KEY) !== "true");
    }, [isAuthRoute]);

    const handleClose = () => {
        window.localStorage.setItem(STORAGE_KEY, "true");
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="tt-cookie-notice" role="status" aria-live="polite">
            <div className="tt-cookie-notice-text">
                TeaTrips uses cookies to keep you signed in and remember your session.
            </div>
            <button
                type="button"
                className="tt-cookie-notice-close"
                aria-label="Dismiss cookie notice"
                onClick={handleClose}
            >
                ×
            </button>
        </div>
    );
}