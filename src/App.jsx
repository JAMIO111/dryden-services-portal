import { Outlet } from "react-router-dom";
import { useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Header from "./components/Header";
import { SearchProvider } from "./contexts/SearchProvider.jsx";
import { NotificationProvider } from "./contexts/NotificationProvider";
import NotificationPane from "./components/NotificationPane";
function App() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <SearchProvider>
      <NotificationProvider>
        <NotificationPane />
        <div className="flex w-screen h-screen overflow-hidden">
          <Navbar
            isMobileOpen={isMobileNavOpen}
            onCloseMobile={() => setIsMobileNavOpen(false)}
          />
          <main className="flex flex-col flex-1 h-full min-w-0">
            <Header onOpenMobileNav={() => setIsMobileNavOpen(true)} />
            <div className="flex flex-col flex-1 overflow-hidden min-w-0">
              <Outlet />
            </div>
          </main>
        </div>
      </NotificationProvider>
    </SearchProvider>
  );
}

export default App;
