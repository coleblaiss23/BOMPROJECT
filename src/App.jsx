import { NavLink, Route, Routes } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import ExplorePage from "./pages/ExplorePage";
import ScripturePage from "./pages/ScripturePage";

function navLinkClass({ isActive }) {
  return isActive ? "active" : undefined;
}

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-title-block">
            <h1 className="app-title">Doctrine of Christ Explorer</h1>
            <p className="app-title-url">
              <a
                href="https://coleblaiss23.github.io/BOMPROJECT/"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://coleblaiss23.github.io/BOMPROJECT/
              </a>
            </p>
          </div>
          <nav className="app-nav" aria-label="Main navigation">
            <NavLink to="/" end className={navLinkClass}>
              Explore Prophets
            </NavLink>
            <NavLink to="/chat" className={navLinkClass}>
              Ask the Tutor
            </NavLink>
            <NavLink to="/scriptures" className={navLinkClass}>
              Scripture Search
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<ExplorePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/scriptures" element={<ScripturePage />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>This site is subject to errors.</p>
      </footer>
    </div>
  );
}
