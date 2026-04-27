import { Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import VaultPage from "./pages/VaultPage";
import DetectionMapPage from "./pages/DetectionMapPage";
import EvidenceBoardPage from "./pages/EvidenceBoardPage";
import DetectionPage from "./pages/DetectionPage";
import CommunityShieldPage from "./pages/CommunityShieldPage";

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 font-[Lexend,sans-serif] text-white">
      <ErrorBoundary fallbackMessage="PulseVerify encountered an unexpected error. Your data is safe — click 'Try again' to recover.">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/vault" element={<VaultPage />} />
          <Route path="/detection-map" element={<DetectionMapPage />} />
          <Route path="/evidence" element={<EvidenceBoardPage />} />
          <Route path="/detection" element={<DetectionPage />} />
          <Route path="/community" element={<CommunityShieldPage />} />
        </Routes>
      </ErrorBoundary>
    </div>
  );
}
