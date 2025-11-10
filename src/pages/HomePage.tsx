import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GreenhouseCard } from '../components/GreenhouseCard';
import { SearchIcon, BellIcon, XIcon } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface Sensor {
  sensor_id: string;
  name: string;
  location: string;
  description: string;
  image_url: string;
  current_sensors?: {
    soil_moisture_pct: number;
    temperature_c: number;
    humidity_pct: number;
    light_lux: number;
  } | null;
}

type FilterType = 'all' | 'active' | 'offline';

export function HomePage() {
  const navigate = useNavigate();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/sensors/locations`);
        if (!response.ok) {
          throw new Error('Failed to fetch sensors');
        }
        const data = await response.json();
        setSensors(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSensors();
  }, []);
  return <motion.div initial={{
    opacity: 0,
    x: -20
  }} animate={{
    opacity: 1,
    x: 0
  }} exit={{
    opacity: 0,
    x: 20
  }} transition={{
    duration: 0.3
  }} className="w-full min-h-screen bg-green-50 flex flex-col relative">
      {/* Green header background that extends down */}
      <div className="absolute top-0 left-0 right-0 bg-green-600 rounded-b-[2.5rem] shadow-xl" style={{ height: '340px' }}></div>
      
      {/* Content over the green background */}
      <div className="relative z-10 px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/settings')}
            className="rounded-full"
          >
            <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 hover:border-white/60 transition-all">
              <img 
                src="https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png" 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover" 
              />
            </div>
          </motion.button>
          <div className="flex items-center gap-2">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              <SearchIcon className="w-5 h-5 text-white" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotification(!showNotification)}
              className="p-2.5 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors relative"
            >
              <BellIcon className="w-5 h-5 text-white" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </motion.button>
          </div>
        </div>

        {/* Notification Popup */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="absolute top-20 right-5 bg-white rounded-2xl shadow-2xl p-4 max-w-xs z-50 border-2 border-green-100"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <h3 className="font-bold text-green-600 text-sm mb-1">📢 Presentation Notice</h3>
                  <p className="text-gray-700 text-xs leading-relaxed">
                    This is a proof of concept demonstration for the DAP Next Gen Competition presentation only.
                  </p>
                </div>
                <button
                  onClick={() => setShowNotification(false)}
                  className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XIcon className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold text-white mb-2"
        >
          Your Sensors
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-white/90 text-sm mb-5"
        >
          Access your farm sensors in one place.
        </motion.p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveFilter('all')}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap shadow-md transition-colors ${
              activeFilter === 'all'
                ? 'bg-white text-green-600'
                : 'bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30'
            }`}
          >
            All Sensors
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveFilter('active')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === 'active'
                ? 'bg-white text-green-600 shadow-md'
                : 'bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30'
            }`}
          >
            Active
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveFilter('offline')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === 'offline'
                ? 'bg-white text-green-600 shadow-md'
                : 'bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30'
            }`}
          >
            Offline
          </motion.button>
        </div>
      </div>
      
      {/* Sensor cards section */}
      <div className="relative z-10 flex-1 px-5 space-y-4 pb-32">
        {loading && (
          <div className="flex flex-col justify-center items-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full"
            />
            <p className="text-green-600 font-medium mt-4">Loading sensors...</p>
          </div>
        )}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 text-red-800 shadow-sm"
          >
            <p className="font-semibold text-lg">Error loading sensors</p>
            <p className="text-sm mt-1">{error}</p>
          </motion.div>
        )}
        
        {/* Offline Filter - Coming Soon Message */}
        {!loading && !error && activeFilter === 'offline' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 text-center shadow-lg border-2 border-green-100"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🚧</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-600 text-sm">
              We are currently working to support offline sensor monitoring. This feature will be available soon!
            </p>
          </motion.div>
        )}
        
        {/* All Sensors and Active Filter - Show sensors */}
        {!loading && !error && (activeFilter === 'all' || activeFilter === 'active') && sensors.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 text-center shadow-lg border border-green-100"
          >
            <p className="text-gray-600">No sensors found. Add a sensor to get started.</p>
          </motion.div>
        )}
        {!loading && !error && (activeFilter === 'all' || activeFilter === 'active') && sensors.map(sensor => <GreenhouseCard key={sensor.sensor_id} id={sensor.sensor_id} name={sensor.name} location={sensor.location} description={sensor.description || 'No description available'} image={sensor.image_url || 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&q=80'} temperature={sensor.current_sensors?.temperature_c || 0} humidity={sensor.current_sensors?.humidity_pct || 0} soilMoisture={sensor.current_sensors?.soil_moisture_pct || 0} />)}
      </div>
    </motion.div>;
}