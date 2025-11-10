import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, FilterIcon, Loader2Icon } from 'lucide-react';
import { API_BASE_URL } from '../config';

export function SessionFilterPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterData, setFilterData] = useState({
    crop_category: 'Vegetables',
    budget_php: 50000,
    waiting_tolerance_days: 90,
    land_size_ha: 1.0,
    manpower: 3
  });

  const categories = [
    'Vegetables',
    'Fruits',
    'Cereals',
    'Legumes',
    'Cash Crops',
    'Fodder',
    'Herbs',
    'Ornamentals'
  ];

  const handleApplyFilter = async () => {
    if (!sessionId) return;

    try {
      setIsFiltering(true);
      
      let userUid = localStorage.getItem('piliseed_user_uid');
      
      const response = await fetch(`${API_BASE_URL}/recommendations/session/${sessionId}/filter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          farmer: filterData,
          user_uid: userUid,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to apply filter');
      }

      const data = await response.json();
      
      if (data.user_uid && !userUid) {
        localStorage.setItem('piliseed_user_uid', data.user_uid);
      }
      
      navigate(`/history/filter/${data.id}`);
    } catch (err) {
      console.error('Error applying filter:', err);
      alert('Failed to apply filter. Please try again.');
    } finally {
      setIsFiltering(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 pb-32">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="px-5 py-4 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(`/history/${sessionId}`)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Filter Crops</h1>
            <p className="text-sm text-gray-500">Personalize recommendations</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-xl">
            <FilterIcon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="px-5 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-blue-50 border border-blue-200 rounded-2xl p-4"
        >
          <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 How filtering works</h4>
          <p className="text-xs text-blue-700 leading-relaxed">
            The AI will analyze your preferences and select 1-5 crops from the original recommendations 
            that best match your budget, timeline, land size, and manpower constraints. This helps you 
            focus on the most suitable options for your farm.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 space-y-6"
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Farmer Preferences</h3>
            <p className="text-sm text-gray-600 mb-6">
              Customize the recommendations based on your specific farming needs and resources.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Crop Category
              </label>
              <select
                value={filterData.crop_category}
                onChange={(e) => setFilterData({ ...filterData, crop_category: e.target.value })}
                className="w-full px-4 py-3 bg-green-50 border-2 border-green-100 rounded-xl focus:outline-none focus:border-green-600 text-gray-900 font-medium transition-colors"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Budget (PHP)
              </label>
              <input
                type="number"
                value={filterData.budget_php}
                onChange={(e) => setFilterData({ ...filterData, budget_php: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-green-50 border-2 border-green-100 rounded-xl focus:outline-none focus:border-green-600 text-gray-900 font-medium transition-colors"
                min="0"
                step="1000"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                ₱{filterData.budget_php.toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Waiting Tolerance (Days)
              </label>
              <input
                type="number"
                value={filterData.waiting_tolerance_days}
                onChange={(e) => setFilterData({ ...filterData, waiting_tolerance_days: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-green-50 border-2 border-green-100 rounded-xl focus:outline-none focus:border-green-600 text-gray-900 font-medium transition-colors"
                min="0"
                step="1"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Maximum days you can wait for harvest
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Land Size (Hectares)
              </label>
              <input
                type="number"
                value={filterData.land_size_ha}
                onChange={(e) => setFilterData({ ...filterData, land_size_ha: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-green-50 border-2 border-green-100 rounded-xl focus:outline-none focus:border-green-600 text-gray-900 font-medium transition-colors"
                min="0"
                step="0.1"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                {filterData.land_size_ha} hectare{filterData.land_size_ha !== 1 ? 's' : ''}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Available Manpower
              </label>
              <input
                type="number"
                value={filterData.manpower}
                onChange={(e) => setFilterData({ ...filterData, manpower: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-green-50 border-2 border-green-100 rounded-xl focus:outline-none focus:border-green-600 text-gray-900 font-medium transition-colors"
                min="0"
                step="1"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                {filterData.manpower} worker{filterData.manpower !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleApplyFilter}
            disabled={isFiltering}
            className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            {isFiltering ? (
              <>
                <Loader2Icon className="w-5 h-5 animate-spin" />
                <span>Filtering...</span>
              </>
            ) : (
              <>
                <FilterIcon className="w-5 h-5" />
                <span>Apply Filter</span>
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
