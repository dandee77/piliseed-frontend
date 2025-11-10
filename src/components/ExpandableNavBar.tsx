import { motion, AnimatePresence } from 'framer-motion';
import { HomeIcon, MessageCircleIcon, BarChart3Icon, ClockIcon, MapPinIcon, SproutIcon, SparklesIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ExpandableNavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isExpanded: boolean;
  sessionMode?: {
    sessionId: string;
    onFilterClick: () => void;
  };
}

export function ExpandableNavBar({
  activeTab,
  setActiveTab,
  isExpanded,
  sessionMode
}: ExpandableNavBarProps) {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    setActiveTab('home');
    navigate('/');
  };

  const handleChatClick = () => {
    if (sessionMode) {
      setActiveTab('chat');
      navigate(`/history/${sessionMode.sessionId}/chat`);
    } else {
      setActiveTab('chat');
      navigate('/chat');
    }
  };

  const handleHistoryClick = () => {
    setActiveTab('history');
    navigate('/history');
  };

  const handleContextClick = () => {
    if (sessionMode) {
      setActiveTab('context');
      navigate(`/history/${sessionMode.sessionId}/context`);
    }
  };

  const handleFilterHistoryClick = () => {
    if (sessionMode) {
      setActiveTab('filter-history');
      navigate(`/history/${sessionMode.sessionId}/filters`);
    }
  };

  const handleSessionHomeClick = () => {
    if (sessionMode) {
      setActiveTab('session-home');
      navigate(`/history/${sessionMode.sessionId}`);
    }
  };

  const getActivePosition = () => {
    if (sessionMode) {
      const tab = activeTab as string;
      // Navbar is expanded when on: session-home, filter, or filter-history
      const isSessionExpanded = tab === 'session-home' || tab === 'filter' || tab === 'filter-history';
      
      // Button order when expanded: session-home, filter, filter-history, context, chat
      // Button order when collapsed: session-home, context, chat
      if (tab === 'session-home') return 34;
      
      if (isSessionExpanded) {
        // Expanded state: 5 buttons visible
        if (tab === 'filter') return 86;
        if (tab === 'filter-history') return 138;
      } else {
        // Collapsed state: 3 buttons visible (session-home, context, chat)
        if (tab === 'context') return 70;
        if (tab === 'chat') return 120;
      }
      return 12;
    }

    if (!isExpanded) {
      if (activeTab === 'home') return 17;
      if (activeTab === 'chat') return 68;
      if (activeTab === 'history') return 122;
    } else {
      if (activeTab === 'home') return 12;
      if (activeTab === 'data') return 76;
      if (activeTab === 'chat') return 140;
      if (activeTab === 'history') return 204;
    }
    return 34;
  };

  if (sessionMode) {
    // Navbar should be expanded when on: session-home, filter, or filter-history
    // Navbar should be collapsed when on: context or chat
    const isExpanded = activeTab === 'session-home' || activeTab === 'filter' || activeTab === 'filter-history';
    
    return (
      <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-8 px-5 pointer-events-none z-50">
        <motion.div
          className="bg-green-600 rounded-full shadow-2xl flex items-center justify-center gap-1 px-3 py-3 relative pointer-events-auto border-2 border-white/20 backdrop-blur-sm"
          initial={false}
          animate={{ width: isExpanded ? '328px' : '192px' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Background highlighter for expanding buttons */}
          <AnimatePresence>
            {isExpanded && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-[34px] top-3 w-12 h-12 bg-black/20 rounded-full"
                />
                <motion.div
                  className="absolute left-[34px] top-3 bottom-3 bg-black/10 rounded-full"
                  initial={{ width: 48, opacity: 0 }}
                  animate={{ width: 157, opacity: 1 }}
                  exit={{ width: 48, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              </>
            )}
          </AnimatePresence>

          {/* White active indicator */}
          <motion.div
            className="absolute w-12 h-12 bg-white rounded-full shadow-lg"
            style={{
              boxShadow: '0 4px 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 255, 255, 0.2)'
            }}
            animate={{ left: getActivePosition() }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />

          {/* Session Home Button - Always visible */}
          <button
            onClick={handleSessionHomeClick}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-colors relative z-10"
          >
            <SproutIcon className={`w-6 h-6 ${activeTab === 'session-home' ? 'text-green-600' : 'text-white'}`} />
          </button>

          {/* Filter Button - Only visible when expanded */}
          <AnimatePresence>
            {isExpanded && (
              <motion.button
                initial={{ opacity: 0, x: -10, width: 0 }}
                animate={{ opacity: 1, x: 0, width: 48 }}
                exit={{ opacity: 0, x: -10, width: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={() => {
                  setActiveTab('filter');
                  navigate(`/history/${sessionMode.sessionId}/filter`);
                }}
                className="h-12 rounded-full flex items-center justify-center relative z-10"
              >
                <SparklesIcon className={`w-6 h-6 ${(activeTab as string) === 'filter' ? 'text-green-600' : 'text-white'}`} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Filter History Button - Only visible when expanded, right beside filter */}
          <AnimatePresence>
            {isExpanded && (
              <motion.button
                initial={{ opacity: 0, x: -10, width: 0 }}
                animate={{ opacity: 1, x: 0, width: 48 }}
                exit={{ opacity: 0, x: -10, width: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={handleFilterHistoryClick}
                className="h-12 rounded-full flex items-center justify-center relative z-10"
              >
                <ClockIcon className={`w-6 h-6 ${(activeTab as string) === 'filter-history' ? 'text-green-600' : 'text-white'}`} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Context Button - Always visible */}
          <button
            onClick={handleContextClick}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-colors relative z-10"
          >
            <MapPinIcon className={`w-6 h-6 ${activeTab === 'context' ? 'text-green-600' : 'text-white'}`} />
          </button>

          {/* Chat Button - Always visible */}
          <button
            onClick={handleChatClick}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-colors relative z-10"
          >
            <MessageCircleIcon className={`w-6 h-6 ${activeTab === 'chat' ? 'text-green-600' : 'text-white'}`} />
          </button>
        </motion.div>
      </div>
    );
  }
  return <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-8 px-5 pointer-events-none z-50">
      <motion.div className="bg-green-600 rounded-full shadow-2xl flex items-center justify-center gap-1 px-3 py-3 relative pointer-events-auto border-2 border-white/20 backdrop-blur-sm" initial={false} animate={{
      width: isExpanded ? '264px' : '192px'
    }} transition={{
      type: 'spring',
      stiffness: 300,
      damping: 30
    }}>
        <AnimatePresence>
          {isExpanded && <>
              <motion.div initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} exit={{
            opacity: 0
          }} className="absolute left-3 top-3 w-12 h-12 bg-black/20 rounded-full" />
              <motion.div className="absolute left-3 top-3 bottom-3 bg-black/10 rounded-full" initial={{
            width: 48
          }} animate={{
            width: 128
          }} exit={{
            width: 48
          }} transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30
          }} />
            </>}
        </AnimatePresence>
        <motion.div className="absolute w-12 h-12 bg-white rounded-full shadow-lg" style={{
        boxShadow: '0 4px 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 255, 255, 0.2)'
      }} animate={{
        left: getActivePosition()
      }} transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30
      }} />
        <button onClick={handleHomeClick} className="w-12 h-12 rounded-full flex items-center justify-center transition-colors relative z-10">
          <HomeIcon className={`w-6 h-6 ${activeTab === 'home' ? 'text-green-600' : 'text-white'}`} />
        </button>
        <AnimatePresence>
          {isExpanded && <motion.button initial={{
          opacity: 0,
          x: -10,
          width: 0
        }} animate={{
          opacity: 1,
          x: 0,
          width: 48
        }} exit={{
          opacity: 0,
          x: -10,
          width: 0
        }} transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }} onClick={() => setActiveTab('data')} className="h-12 rounded-full flex items-center justify-center relative z-10">
              <BarChart3Icon className={`w-6 h-6 ${activeTab === 'data' ? 'text-green-600' : 'text-white'}`} />
            </motion.button>}
        </AnimatePresence>
        <button onClick={handleChatClick} className="w-12 h-12 rounded-full flex items-center justify-center transition-colors relative z-10">
          <MessageCircleIcon className={`w-6 h-6 ${activeTab === 'chat' ? 'text-green-600' : 'text-white'}`} />
        </button>
        <button onClick={handleHistoryClick} className="w-12 h-12 rounded-full flex items-center justify-center transition-colors relative z-10">
          <ClockIcon className={`w-6 h-6 ${activeTab === 'history' ? 'text-green-600' : 'text-white'}`} />
        </button>
      </motion.div>
    </div>;
}