import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/useAuth";
import { StrictMode, useEffect } from "react";
import { subscribeRealtime } from "./lib/realtime";

// Register service worker for push notifications
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").then(() => {
    console.log("✅ Service Worker registered");
  }).catch((error) => {
    console.error("❌ Service Worker registration failed:", error);
  });
}

function RootApp() {
  useEffect(() => {
    subscribeRealtime();
  }, []);

  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootApp />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
