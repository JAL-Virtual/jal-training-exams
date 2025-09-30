'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PerformanceMetric {
  id: string;
  title: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  icon: string;
  color: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate: string;
  category: 'training' | 'exam' | 'milestone' | 'special';
}

interface TrainingStats {
  totalTrainings: number;
  completedTrainings: number;
  averageCompletionTime: number;
  successRate: number;
  currentStreak: number;
  longestStreak: number;
}

export default function PerformanceMetricsWidget() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [trainingStats, setTrainingStats] = useState<TrainingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        // Mock data - in real implementation, fetch from API
        const mockMetrics: PerformanceMetric[] = [
          {
            id: '1',
            title: 'Training Success Rate',
            value: 94,
            target: 90,
            unit: '%',
            trend: 'up',
            trendValue: 3.2,
            icon: '📈',
            color: 'green'
          },
          {
            id: '2',
            title: 'Avg Completion Time',
            value: 2.3,
            target: 3.0,
            unit: 'days',
            trend: 'down',
            trendValue: 0.5,
            icon: '⏱️',
            color: 'blue'
          },
          {
            id: '3',
            title: 'Exam Pass Rate',
            value: 87,
            target: 85,
            unit: '%',
            trend: 'up',
            trendValue: 2.1,
            icon: '🎯',
            color: 'purple'
          },
          {
            id: '4',
            title: 'Training Hours',
            value: 156,
            target: 120,
            unit: 'hrs',
            trend: 'up',
            trendValue: 12,
            icon: '⏰',
            color: 'orange'
          }
        ];

        const mockAchievements: Achievement[] = [
          {
            id: '1',
            title: 'Training Excellence',
            description: 'Completed 10+ training sessions with 95%+ success rate',
            icon: '🏆',
            earnedDate: '2024-12-01',
            category: 'training'
          },
          {
            id: '2',
            title: 'Quick Learner',
            description: 'Completed training 50% faster than average',
            icon: '⚡',
            earnedDate: '2024-11-28',
            category: 'milestone'
          },
          {
            id: '3',
            title: 'Perfect Score',
            description: 'Achieved 100% on Instrument Rating exam',
            icon: '💯',
            earnedDate: '2024-11-20',
            category: 'exam'
          },
          {
            id: '4',
            title: 'Consistency Master',
            description: 'Maintained 30-day training streak',
            icon: '🔥',
            earnedDate: '2024-11-15',
            category: 'milestone'
          }
        ];

        const mockTrainingStats: TrainingStats = {
          totalTrainings: 24,
          completedTrainings: 22,
          averageCompletionTime: 2.3,
          successRate: 94,
          currentStreak: 12,
          longestStreak: 30
        };

        setMetrics(mockMetrics);
        setAchievements(mockAchievements);
        setTrainingStats(mockTrainingStats);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching performance data:', error);
        setIsLoading(false);
      }
    };

    fetchPerformanceData();
  }, []);

  const getTrendIcon = (trend: string) => {
    const icons = {
      up: '↗️',
      down: '↘️',
      stable: '→'
    };
    return icons[trend as keyof typeof icons] || '→';
  };

  const getTrendColor = (trend: string, metric: PerformanceMetric) => {
    if (trend === 'up') {
      return metric.title.includes('Completion Time') ? 'text-red-600' : 'text-green-600';
    } else if (trend === 'down') {
      return metric.title.includes('Completion Time') ? 'text-green-600' : 'text-red-600';
    }
    return 'text-gray-600';
  };

  const getAchievementColor = (category: string) => {
    const colors = {
      training: 'bg-blue-100 text-blue-600',
      exam: 'bg-green-100 text-green-600',
      milestone: 'bg-purple-100 text-purple-600',
      special: 'bg-yellow-100 text-yellow-600'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View Details
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">{metric.icon}</div>
              <div className={`text-sm font-medium ${getTrendColor(metric.trend, metric)}`}>
                {getTrendIcon(metric.trend)} {metric.trendValue}{metric.unit}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metric.value}{metric.unit}
            </div>
            <div className="text-sm text-gray-600 mb-2">{metric.title}</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  metric.value >= metric.target ? 'bg-green-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Target: {metric.target}{metric.unit}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Training Statistics */}
      {trainingStats && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Training Statistics</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Trainings:</span>
              <span className="font-medium">{trainingStats.totalTrainings}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed:</span>
              <span className="font-medium">{trainingStats.completedTrainings}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Current Streak:</span>
              <span className="font-medium text-orange-600">{trainingStats.currentStreak} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Longest Streak:</span>
              <span className="font-medium text-purple-600">{trainingStats.longestStreak} days</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Achievements */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Achievements</h4>
        <div className="space-y-3">
          {achievements.slice(0, 3).map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                {achievement.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium text-gray-900">{achievement.title}</h5>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAchievementColor(achievement.category)}`}>
                    {achievement.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Earned on {new Date(achievement.earnedDate).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        
        {achievements.length > 3 && (
          <button className="w-full mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All Achievements ({achievements.length})
          </button>
        )}
      </div>
    </div>
  );
}
