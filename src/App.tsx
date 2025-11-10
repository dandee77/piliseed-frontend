import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { HomePage } from './pages/HomePage';
import { GreenhouseDetail } from './pages/GreenhouseDetail';
import { HistoryPage } from './pages/HistoryPage';
import { SensorHistoryPage } from './pages/SensorHistoryPage';
import { HistoryDetailPage } from './pages/HistoryDetailPage';
import { HistoryContextPage } from './pages/HistoryContextPage';
import { HistoryCropDetail } from './pages/HistoryCropDetail';
import { HistoryChatPage } from './pages/HistoryChatPage';
import { SessionFilterPage } from './pages/SessionFilterPage';
import { FilteredSessionsPage } from './pages/FilteredSessionsPage';
import { FilterDetailPage } from './pages/FilterDetailPage';
import { FilterCropDetail } from './pages/FilterCropDetail';
import SettingsPage from './pages/SettingsPage';
import { ChatPage } from './pages/ChatPage';
import { ExpandableNavBar } from './components/ExpandableNavBar';

function AnimatedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const isDetailPage = location.pathname.includes('/greenhouse/');
  
  const sessionMatch = location.pathname.match(/\/history\/([^\/]+)(\/|$)/);
  const isSessionDetailPage = sessionMatch && sessionMatch[1] && 
    !['filter'].includes(sessionMatch[1]) &&
    !location.pathname.match(/\/history\/[^\/]+\/crops\/\d+/);
  const sessionId = sessionMatch ? sessionMatch[1] : null;
  
  const shouldHideNavbar = 
    location.pathname === '/' ||
    location.pathname === '/settings' ||
    location.pathname.match(/\/sensor\/[^\/]+\/history/) ||
    location.pathname.match(/\/history\/[^\/]+\/crops\/\d+/) ||
    location.pathname.match(/\/history\/filter\//);

  useEffect(() => {
    if (location.pathname === '/') {
      setActiveTab('home');
    } else if (location.pathname === '/chat') {
      setActiveTab('chat');
    } else if (location.pathname.includes('/history')) {
      if (location.pathname.match(/\/history\/[^\/]+\/context/)) {
        setActiveTab('context');
      } else if (location.pathname.match(/\/history\/[^\/]+\/chat/)) {
        setActiveTab('chat');
      } else if (location.pathname.match(/\/history\/[^\/]+\/filter$/)) {
        setActiveTab('filter');
      } else if (location.pathname.match(/\/history\/[^\/]+\/filters/)) {
        setActiveTab('filter-history');
      } else if (isSessionDetailPage) {
        setActiveTab('session-home');
      } else {
        setActiveTab('history');
      }
    } else if (location.pathname.includes('/greenhouse/')) {
      setActiveTab('data');
    }
  }, [location.pathname]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    if (tab === 'chat') {
      navigate('/chat');
    } else if (tab === 'data' && isDetailPage) {
      const match = location.pathname.match(/\/greenhouse\/([^\/]+)/);
      if (match) {
        navigate(`/greenhouse/${match[1]}`);
      }
    } else if (tab === 'history') {
      navigate('/history');
    } else if (tab === 'home') {
      navigate('/');
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/sensor/:sensorId/history" element={<SensorHistoryPage />} />
          <Route path="/greenhouse/:id" element={<GreenhouseDetail />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/history/:sessionId" element={<HistoryDetailPage />} />
          <Route path="/history/:sessionId/context" element={<HistoryContextPage />} />
          <Route path="/history/:sessionId/chat" element={<HistoryChatPage />} />
          <Route path="/history/:sessionId/filter" element={<SessionFilterPage />} />
          <Route path="/history/:sessionId/crops/:cropIndex" element={<HistoryCropDetail />} />
          <Route path="/history/:sessionId/filters" element={<FilteredSessionsPage />} />
          <Route path="/history/filter/:filterId" element={<FilterDetailPage />} />
          <Route path="/history/filter/:filterId/crop/:cropIndex" element={<FilterCropDetail />} />
        </Routes>
      </AnimatePresence>
      {!shouldHideNavbar && (
        <ExpandableNavBar 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
          isExpanded={isDetailPage}
          sessionMode={isSessionDetailPage && sessionId ? {
            sessionId,
            onFilterClick: () => {}
          } : undefined}
        />
      )}
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <div className="w-full min-h-screen bg-gray-50" style={{
        maxWidth: '430px',
        margin: '0 auto'
      }}>
        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  );
}
