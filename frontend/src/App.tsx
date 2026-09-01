import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import PageContainer from "./components/layout/PageContainer";
import Dashboard from "./pages/Dashboard";
import Signatures from "./pages/Signatures";
import ThreatDetection from "./pages/ThreatDetection";
import QuantumEngine from "./pages/QuantumEngine";
import PostQuantum from "./pages/PostQuantum";
import Blockchain from "./pages/Blockchain";
import EventsPage from "./pages/Events";
import Alerts from "./pages/Alerts";
import Keys from "./pages/Keys";

export default function App() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />
        <PageContainer>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/signatures" element={<Signatures />} />
            <Route path="/threat-detection" element={<ThreatDetection />} />
            <Route path="/quantum-engine" element={<QuantumEngine />} />
            <Route path="/post-quantum" element={<PostQuantum />} />
            <Route path="/blockchain" element={<Blockchain />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/keys" element={<Keys />} />
          </Routes>
        </PageContainer>
      </div>
    </div>
  );
}
