import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, SproutIcon, PlusCircleIcon } from 'lucide-react';
import { CropCard } from '../components/CropCard';
import { API_BASE_URL } from '../config';

interface CropRecommendation {
  crop: string;
  searchable_name?: string;
  image_url?: string;
  scientific_name: string;
  category: string;
  planted?: boolean;
  scores: {
    overall_score: number;
    confidence_pct: number;
    env_score: number;
    econ_score: number;
    time_fit_score: number;
    season_score: number;
    labor_score: number;
    risk_score: number;
    market_score: number;
  };
  growth_requirements: any;
  tolerances: any;
  management: any;
  economics: any;
  market_strategy: any;
  planting_schedule: any;
  risk_assessment: any;
  reasoning: string;
}

interface SensorData {
  soil_moisture_pct: number;
  temperature_c: number;
  humidity_pct: number;
  light_lux: number;
}

export function HistoryDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [sensorId, setSensorId] = useState<string>('');
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    if (!sessionId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/recommendations/session/${sessionId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch session details');
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
      setSensorId(data.sensor_id);

      // Use sensor_data from session response (included for hardware-generated recommendations)
      if (data.sensor_data) {
        setSensorData(data.sensor_data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!sensorId || !sensorData) {
      setError('Cannot load more recommendations: sensor data not available');
      return;
    }

    try {
      setIsLoadingMore(true);
      setError(null);

      // Extract already generated crop names
      const alreadyGenerated = recommendations.map(crop => crop.crop);

      // Call hardware endpoint with sensor data and already_generated list
      const response = await fetch(`${API_BASE_URL}/recommendations/hardware/${sensorId}/readings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          soil_moisture_pct: sensorData.soil_moisture_pct,
          temperature_c: sensorData.temperature_c,
          humidity_pct: sensorData.humidity_pct,
          light_lux: sensorData.light_lux,
          already_generated: alreadyGenerated,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate more recommendations');
      }

      // Refetch the session to get the newly added crops
      await fetchSessionDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more recommendations');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleBack = () => {
    if (sensorId) {
      navigate(`/sensor/${sensorId}/history`);
    } else {
      navigate('/');
    }
  };

  const handleCropClick = (index: number) => {
    navigate(`/history/${sessionId}/crops/${index}`);
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
            <h1 className="text-2xl font-bold text-gray-900">Session Crops</h1>
            <p className="text-sm text-gray-500">
              {recommendations.length} recommendations
            </p>
          </div>
          <div className="p-3 bg-lime-100 rounded-xl">
            <SproutIcon className="w-6 h-6 text-lime-600" />
          </div>
        </div>
      </div>

      <div className="px-5 py-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
          >
            <p className="text-red-800 text-sm">{error}</p>
          </motion.div>
        )}

        {recommendations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <SproutIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Crops Found</h3>
            <p className="text-sm text-gray-600">
              This session has no crop recommendations.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <p className="text-sm text-gray-600">
                Crop recommendations from this session:
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {recommendations.map((crop, index) => (
                <CropCard
                  key={index}
                  crop={crop.crop}
                  category={crop.category}
                  overallScore={crop.scores.overall_score}
                  imageUrl={crop.image_url}
                  planted={crop.planted}
                  onClick={() => handleCropClick(index)}
                />
              ))}
            </div>

            {/* Load More Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLoadMore}
              disabled={isLoadingMore || !sensorData}
              className={`w-full py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all ${
                isLoadingMore || !sensorData
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isLoadingMore ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-3 border-white border-t-transparent rounded-full"
                  />
                  <span className="text-white font-semibold">Generating More Crops...</span>
                </>
              ) : (
                <>
                  <PlusCircleIcon className="w-6 h-6 text-white" />
                  <span className="text-white font-semibold">Load More Recommendations</span>
                </>
              )}
            </motion.button>

            {!sensorData && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-amber-800 text-xs text-center">
                  Load More is only available for hardware-generated recommendations.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
