import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Toaster } from "./components/ui/toaster.tsx";
import crypto from "node:crypto";

if (typeof global === "undefined") {
  window.global = window;
}
if (typeof Buffer === "undefined") {
  window.Buffer = Buffer;
}
if (typeof window.crypto === "undefined") {
  window.crypto = crypto;
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Toaster />
  </StrictMode>
);
