import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

// Initialize saved theme or default to dark
const savedTheme = localStorage.getItem("theme") || "dark";
if (savedTheme === "dark") {
  document.documentElement.classList.add("dark");
  document.body.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
  document.body.classList.remove("dark");
}

createRoot(document.getElementById("root")!).render(<App />);