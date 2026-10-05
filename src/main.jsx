import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "./contexts/ToastProvider.jsx";
import { ConfirmProvider } from "./contexts/ConfirmationModalProvider.jsx";
import { AuthProvider } from "./contexts/AuthProvider.jsx";
import { UserProvider } from "./contexts/UserProvider.jsx";
import { OrganisationProvider } from "./contexts/OrganisationProvider.jsx";
import { ModalProvider } from "./contexts/ModalContext";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import { router } from "./router.jsx";
import "./index.css";

const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
const storedTheme = localStorage.getItem("theme");

if (storedTheme === "dark" || (!storedTheme && darkQuery.matches)) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

const queryClient = new QueryClient();

// After a fresh deploy, a browser tab left open from before still points
// at the old build's asset hashes. Navigating to a route whose chunk
// isn't lazy-loaded yet then fails to fetch it (the old filename is
// gone), which Vite surfaces as a "vite:preloadError" event rather than
// a normal navigation - left unhandled, that's an uncaught render error
// with no obvious cause. Recover automatically with a single reload,
// which picks up the new build's index.html and correct chunk
// references. Guarded so a genuinely broken deploy can't reload forever.
const PRELOAD_RETRY_KEY = "vite-preload-reload-attempted";
window.addEventListener("vite:preloadError", () => {
  if (!sessionStorage.getItem(PRELOAD_RETRY_KEY)) {
    sessionStorage.setItem(PRELOAD_RETRY_KEY, "1");
    window.location.reload();
  }
});
// Lazy route chunks only start loading once React Router actually
// matches and renders that route, which happens well after the
// document's own "load" event - so clearing the guard on "load" would
// race ahead of the very failure it's meant to catch and let a
// genuinely broken chunk reload forever. Clear it a few seconds after
// load instead, enough time for a route chunk fetch to resolve either
// way, so a different stale chunk hit later in the same tab (e.g. after
// another deploy) still gets its own retry.
window.addEventListener("load", () => {
  setTimeout(() => sessionStorage.removeItem(PRELOAD_RETRY_KEY), 10000);
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfirmProvider>
        <ToastProvider>
          <AuthProvider>
            <UserProvider>
              <OrganisationProvider>
                <ModalProvider>
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center h-dvh bg-primary-bg">
                        <LoadingSpinner />
                      </div>
                    }>
                    <RouterProvider router={router} />
                  </Suspense>
                </ModalProvider>
              </OrganisationProvider>
            </UserProvider>
          </AuthProvider>
        </ToastProvider>
      </ConfirmProvider>
    </QueryClientProvider>
  </StrictMode>
);
console.trace("createRoot called");
