import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, ClockIcon, SproutIcon, CheckCircleIcon, MapPinIcon } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface HistorySession {
  id: string;
  timestamp: string;
  sensor_id: string;
  sensor_name: string;
  location: string | { location_name: string; location_string: string };
  total_crops: number;
  planted_count: number;
}

export function SensorHistoryPage() {
  const { sensorId } = useParams<{ sensorId: string }>();
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistorySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sensorName, setSensorName] = useState<string>('');
  const [sensorLocation, setSensorLocation] = useState<string>('');

  useEffect(() => {
    fetchHistory();
  }, [sensorId]);

  const fetchHistory = async () => {
    if (!sensorId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/recommendations/${sensorId}/history`);

      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      const data = await response.json();
      setHistory(data.history);
      
      // Set sensor name and location from the first history item
      if (data.history.length > 0) {
        setSensorName(data.history[0].sensor_name);
        const location = data.history[0].location;
        // Handle location being either a string or an object
        if (typeof location === 'string') {
          setSensorLocation(location);
        } else if (location && typeof location === 'object') {
          setSensorLocation(location.location_name || location.location_string || 'Unknown Location');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleSessionClick = (sessionId: string) => {
    navigate(`/history/${sessionId}`);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 pb-32">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="px-5 py-4 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{sensorName || 'Sensor History'}</h1>
            {sensorLocation && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <MapPinIcon className="w-4 h-4" />
                <span>{sensorLocation}</span>
              </div>
            )}
          </div>
          <div className="p-3 bg-green-100 rounded-xl">
            <ClockIcon className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="px-5 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClockIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No History Yet</h3>
            <p className="text-gray-600 text-sm">
              This sensor doesn't have any recommendation sessions yet.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {history.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSessionClick(session.id)}
                className="bg-white rounded-2xl shadow-lg p-5 cursor-pointer hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <ClockIcon className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-500">
                        {formatDate(session.timestamp)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
                    <SproutIcon className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">
                      {session.total_crops} {session.total_crops === 1 ? 'Crop' : 'Crops'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                  <span>
                    {session.planted_count} of {session.total_crops} planted
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button className="text-green-600 font-semibold text-sm hover:text-green-700 transition-colors">
                    View Details →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
