import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/teatrips.css'
import './styles/teatrips_dark.css'
import 'react-datepicker/dist/react-datepicker.css';
import ReactDOM from "react-dom/client";
import App from './App.jsx'
import "leaflet/dist/leaflet.css";
import React from "react";

// Check if the user has a preference for dark mode and apply it
const prefersDark = (() => {
  try {
    return localStorage.getItem("tt-dark-mode") === "true";
  } catch {
    return false;
  }
})();

if (prefersDark) {
  document.documentElement.classList.add("tt-dark");
}
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
