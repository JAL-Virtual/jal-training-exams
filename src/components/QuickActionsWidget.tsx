'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  onClick: () => void;
  disabled?: boolean;
}

interface QuickActionsWidgetProps {
  onActionClick: (action: string) => void;
}

export default function QuickActionsWidget({ onActionClick }: QuickActionsWidgetProps) {
  const quickActions: QuickAction[] = [
    {
      id: 'request-training',
      title: 'Request Training',
      description: 'Submit a new training request',
      icon: '📚',
      color: 'blue',
      onClick: () => onActionClick('training-request')
    },
    {
      id: 'view-calendar',
      title: 'Training Calendar',
      description: 'View upcoming training sessions',
      icon: '📅',
      color: 'green',
      onClick: () => onActionClick('training-calendar')
    },
    {
      id: 'my-assignments',
      title: 'My Assignments',
      description: 'View your assigned training',
      icon: '📋',
      color: 'purple',
      onClick: () => onActionClick('my-assignments')
    },
    {
      id: 'issue-token',
      title: 'Issue Test Token',
      description: 'Generate test tokens for exams',
      icon: '🎫',
      color: 'orange',
      onClick: () => onActionClick('issue-test-token')
    },
    {
      id: 'emergency-handbook',
      title: 'Emergency Handbook',
      description: 'Access emergency procedures',
      icon: '🚨',
      color: 'red',
      onClick: () => onActionClick('emergency-handbook')
    },
    {
      id: 'guidelines',
      title: 'Trainer Guidelines',
      description: 'View training guidelines',
      icon: '📖',
      color: 'indigo',
      onClick: () => onActionClick('trainer-guidelines')
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200',
      green: 'bg-green-50 hover:bg-green-100 text-green-600 border-green-200',
      purple: 'bg-purple-50 hover:bg-purple-100 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200',
      red: 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200',
      indigo: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-indigo-200'
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {quickActions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200 
              ${getColorClasses(action.color)}
              ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              flex flex-col items-center text-center space-y-2
            `}
          >
            <div className="text-2xl">{action.icon}</div>
            <div>
              <h4 className="font-medium text-sm">{action.title}</h4>
              <p className="text-xs opacity-75 mt-1">{action.description}</p>
            </div>
          </motion.button>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Click any action above to navigate quickly to that section
        </p>
      </div>
    </div>
  );
}
