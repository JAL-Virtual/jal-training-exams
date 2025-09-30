'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TrainingProgressData {
  month: string;
  requested: number;
  completed: number;
  inProgress: number;
}

export default function TrainingProgressChart() {
  const [progressData, setProgressData] = useState<TrainingProgressData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        // Mock data - in real implementation, fetch from API
        const mockData: TrainingProgressData[] = [
          { month: 'Jan', requested: 45, completed: 38, inProgress: 7 },
          { month: 'Feb', requested: 52, completed: 45, inProgress: 7 },
          { month: 'Mar', requested: 48, completed: 42, inProgress: 6 },
          { month: 'Apr', requested: 61, completed: 55, inProgress: 6 },
          { month: 'May', requested: 58, completed: 52, inProgress: 6 },
          { month: 'Jun', requested: 67, completed: 60, inProgress: 7 }
        ];
        
        setProgressData(mockData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching progress data:', error);
        setIsLoading(false);
      }
    };

    fetchProgressData();
  }, [selectedPeriod]);

  const maxValue = Math.max(...progressData.map(d => Math.max(d.requested, d.completed, d.inProgress)));

  const getCompletionRate = () => {
    if (progressData.length === 0) return 0;
    const latest = progressData[progressData.length - 1];
    return Math.round((latest.completed / latest.requested) * 100);
  };

  const getTotalStats = () => {
    const total = progressData.reduce((acc, curr) => ({
      requested: acc.requested + curr.requested,
      completed: acc.completed + curr.completed,
      inProgress: acc.inProgress + curr.inProgress
    }), { requested: 0, completed: 0, inProgress: 0 });
    
    return total;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const totalStats = getTotalStats();
  const completionRate = getCompletionRate();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Training Progress</h3>
        <div className="flex space-x-2">
          {(['week', 'month', 'quarter'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totalStats.requested}</div>
          <div className="text-sm text-gray-500">Total Requested</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{totalStats.completed}</div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{completionRate}%</div>
          <div className="text-sm text-gray-500">Success Rate</div>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-4">
        {progressData.map((data, index) => (
          <motion.div
            key={data.month}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">{data.month}</span>
              <span className="text-gray-500">{data.completed}/{data.requested}</span>
            </div>
            
            <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
              {/* Completed */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: `${(data.completed / maxValue) * 100}%` 
                }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                className="absolute left-0 top-0 h-full bg-green-500 rounded-l-full"
              />
              
              {/* In Progress */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: `${(data.inProgress / maxValue) * 100}%` 
                }}
                transition={{ delay: index * 0.1 + 0.4, duration: 0.8 }}
                className="absolute h-full bg-orange-400"
                style={{ 
                  left: `${(data.completed / maxValue) * 100}%` 
                }}
              />
              
              {/* Pending */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: `${((data.requested - data.completed - data.inProgress) / maxValue) * 100}%` 
                }}
                transition={{ delay: index * 0.1 + 0.6, duration: 0.8 }}
                className="absolute h-full bg-gray-300"
                style={{ 
                  left: `${((data.completed + data.inProgress) / maxValue) * 100}%` 
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Completed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
          <span className="text-sm text-gray-600">In Progress</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          <span className="text-sm text-gray-600">Pending</span>
        </div>
      </div>
    </div>
  );
}
