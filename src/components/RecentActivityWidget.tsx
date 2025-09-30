'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ActivityItem {
  id: string;
  type: 'training_request' | 'training_completed' | 'exam_scheduled' | 'staff_assigned' | 'system_update';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  icon: string;
  color: string;
}

export default function RecentActivityWidget() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        // Mock data - in real implementation, fetch from API
        const mockActivities: ActivityItem[] = [
          {
            id: '1',
            type: 'training_request',
            title: 'New Training Request',
            description: 'Boeing 737-800 Ground School requested by John Smith',
            timestamp: '2 minutes ago',
            user: 'John Smith',
            icon: '📚',
            color: 'blue'
          },
          {
            id: '2',
            type: 'training_completed',
            title: 'Training Completed',
            description: 'Airbus A320 Type Rating completed by Sarah Johnson',
            timestamp: '15 minutes ago',
            user: 'Sarah Johnson',
            icon: '✅',
            color: 'green'
          },
          {
            id: '3',
            type: 'exam_scheduled',
            title: 'Exam Scheduled',
            description: 'Instrument Rating exam scheduled for tomorrow at 10:00 AM',
            timestamp: '1 hour ago',
            user: 'Mike Chen',
            icon: '📝',
            color: 'purple'
          },
          {
            id: '4',
            type: 'staff_assigned',
            title: 'Staff Assignment',
            description: 'Captain Robert assigned as trainer for Ground School',
            timestamp: '2 hours ago',
            user: 'Robert Wilson',
            icon: '👨‍✈️',
            color: 'orange'
          },
          {
            id: '5',
            type: 'system_update',
            title: 'System Update',
            description: 'Training portal updated with new features',
            timestamp: '3 hours ago',
            icon: '🔧',
            color: 'gray'
          }
        ];

        setActivities(mockActivities);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching recent activities:', error);
        setIsLoading(false);
      }
    };

    fetchRecentActivities();
  }, []);


  const getActivityColor = (type: string) => {
    const colors = {
      training_request: 'text-blue-600',
      training_completed: 'text-green-600',
      exam_scheduled: 'text-purple-600',
      staff_assigned: 'text-orange-600',
      system_update: 'text-gray-600'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-lg">
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm font-medium ${getActivityColor(activity.type)}`}>
                  {activity.title}
                </p>
                <span className="text-xs text-gray-500">{activity.timestamp}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
              {activity.user && (
                <p className="text-xs text-gray-500 mt-1">by {activity.user}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      
      {activities.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">📋</div>
          <p className="text-gray-500">No recent activity</p>
        </div>
      )}
    </div>
  );
}
