'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      <motion.button
        onClick={toggleTheme}
        className="relative p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle theme"
      >
        <div className="relative w-6 h-6">
          {/* Sun Icon */}
          <motion.svg
            className="absolute inset-0 w-6 h-6 text-yellow-600 dark:text-yellow-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            initial={false}
            animate={{
              opacity: theme === 'light' ? 1 : 0,
              rotate: theme === 'light' ? 0 : 180,
              scale: theme === 'light' ? 1 : 0.8,
            }}
            transition={{ duration: 0.3 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </motion.svg>

          {/* Moon Icon */}
          <motion.svg
            className="absolute inset-0 w-6 h-6 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            initial={false}
            animate={{
              opacity: theme === 'dark' ? 1 : 0,
              rotate: theme === 'dark' ? 0 : -180,
              scale: theme === 'dark' ? 1 : 0.8,
            }}
            transition={{ duration: 0.3 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </motion.svg>
        </div>
      </motion.button>
      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
        {theme === 'light' ? 'Day' : 'Night'}
      </span>
    </div>
  );
}
