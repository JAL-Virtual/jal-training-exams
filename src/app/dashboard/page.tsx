'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { isAuthenticated } from '@/lib/api';
import { TrainingStats, TrainingData, QuickReferenceItem } from '@/types';
import UserProfile from '@/components/UserProfile';
import WelcomeSection from '@/components/WelcomeSection';

// Mock data
const mockTrainingData: TrainingData[] = [
  { year: '2022', PP: 3, SPP: 1, CP: 17, ADC: 3, APC: 3, ACC: 0, GCA: 12 },
  { year: '2023', PP: 5, SPP: 2, CP: 22, ADC: 5, APC: 4, ACC: 2, GCA: 15 },
  { year: '2024', PP: 7, SPP: 3, CP: 28, ADC: 7, APC: 6, ACC: 4, GCA: 18 },
  { year: '2025', PP: 2, SPP: 1, CP: 8, ADC: 2, APC: 2, ACC: 1, GCA: 5 }
];

const quickReferenceItems: QuickReferenceItem[] = [
  { title: 'Pilot Documentation', icon: '📄', color: 'blue', dot: 'bg-blue-500' },
  { title: 'ATC Documentation', icon: '📋', color: 'green', dot: 'bg-green-500' },
  { title: 'ATC Route', icon: '🗺️', color: 'yellow', dot: 'bg-yellow-500' },
  { title: 'Pilot Airport Guide', icon: '✈️', color: 'red', dot: 'bg-red-500' },
  { title: 'ATC Local Procedure', icon: '📊', color: 'blue', dot: 'bg-blue-500' },
  { title: 'Division NOTAM', icon: '📢', color: 'green', dot: 'bg-green-500' }
];

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [stats] = useState<TrainingStats>({
    totalTrainingRequested: 15,
    totalTrainingCompleted: 89,
    totalTrainers: 12,
    totalExaminers: 8
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    // Fetch user data to check admin status
    const fetchUserData = async () => {
      try {
        const apiKey = localStorage.getItem('jal_api_key');
        if (!apiKey) return;

        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ apiKey }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.ok && result.user) {
            setUser(result.user);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('jal_api_key');
    localStorage.removeItem('jal_pilot_id');
    localStorage.removeItem('jal_user');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Image 
              src="/img/jal-logo.png"
              alt="Japan Airlines Logo"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <p className="text-xl text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200">
        <div className="p-2 border-b border-gray-200">
          <div className="flex items-center justify-center">
            <Image 
              src="/img/jal-logo-large.png"
              alt="JAL Logo"
              width={160}
              height={160}
              className="object-contain"
            />
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {/* DASHBOARDS */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">DASHBOARDS</h3>
            <div className="space-y-1">
              <button 
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === 'dashboard' 
                    ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setActiveSection('dashboard')}
              >
                Main Dashboard
              </button>
              <button 
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === 'squadron' 
                    ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setActiveSection('squadron')}
              >
                Japan Squadron
              </button>
            </div>
          </div>

          {/* TRAINING DEPARTMENT */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">TRAINING DEPARTMENT</h3>
            <div className="space-y-1">
              <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                Training
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                Approved Trainers
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                Upcoming Training
              </button>
            </div>
          </div>

          {/* EXAM DEPARTMENT */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">EXAM DEPARTMENT</h3>
            <div className="space-y-1">
              <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                Request Exam
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                Theoretical Checkout
              </button>
            </div>
          </div>

          {/* RESOURCES DEPARTMENT */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">RESOURCES DEPARTMENT</h3>
            <div className="space-y-1">
              <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                Local Procedures
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                Charts
              </button>
            </div>
          </div>

          {/* MANAGEMENT DEPARTMENT - Admin Only */}
          {user && (user.rank?.name?.toLowerCase().includes('admin') || 
                   user.rank?.name?.toLowerCase().includes('manager') || 
                   user.rank?.name?.toLowerCase().includes('chief') ||
                   user.rank_id === '1' || // Assuming rank_id 1 is admin
                   user.id === 1) && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">MANAGEMENT DEPARTMENT</h3>
              <div className="space-y-1">
                <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                  User Management
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                  System Settings
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                  Reports & Analytics
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                  Audit Logs
                </button>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <span className="text-gray-700 font-medium">Statistics</span>
              <span className="text-gray-700 font-medium">Settings</span>
            </div>
            
            <UserProfile onLogout={handleLogout} />
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-6 space-y-6">
          {/* Welcome Section */}
          <WelcomeSection />

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-sm font-medium opacity-90 mb-2">Total Training Requested</h3>
              <p className="text-3xl font-bold">{stats.totalTrainingRequested}</p>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-sm font-medium opacity-90 mb-2">Total Training Completed</h3>
              <p className="text-3xl font-bold">{stats.totalTrainingCompleted}</p>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-sm font-medium opacity-90 mb-2">Total Available Trainers/Examiners</h3>
              <p className="text-3xl font-bold">{stats.totalTrainers}/{stats.totalExaminers}</p>
            </motion.div>
          </div>

          {/* Training Report and Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Training Report */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">TRAINING REPORT</h3>
              <p className="text-sm text-gray-600 mb-4">Training Statistics</p>
              
              {/* Legend */}
              <div className="flex flex-wrap gap-2 mb-4">
                {['PP', 'SPP', 'CP', 'ADC', 'APC', 'ACC', 'GCA'].map((label, index) => {
                  const colors = ['bg-blue-500', 'bg-blue-300', 'bg-red-500', 'bg-green-500', 'bg-green-700', 'bg-teal-500', 'bg-pink-500'];
                  return (
                    <div key={label} className="flex items-center space-x-1">
                      <div className={`w-3 h-3 rounded ${colors[index]}`}></div>
                      <span className="text-xs text-gray-600">{label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Chart */}
              <div className="space-y-3">
                {mockTrainingData.map((year) => (
                  <div key={year.year} className="flex items-center space-x-3">
                    <div className="w-12 text-sm text-gray-600">{year.year}</div>
                    <div className="flex-1 flex h-6 bg-gray-100 rounded">
                      <div className="bg-blue-500" style={{ width: `${(year.PP / 30) * 100}%` }}></div>
                      <div className="bg-blue-300" style={{ width: `${(year.SPP / 30) * 100}%` }}></div>
                      <div className="bg-red-500" style={{ width: `${(year.CP / 30) * 100}%` }}></div>
                      <div className="bg-green-500" style={{ width: `${(year.ADC / 30) * 100}%` }}></div>
                      <div className="bg-green-700" style={{ width: `${(year.APC / 30) * 100}%` }}></div>
                      <div className="bg-teal-500" style={{ width: `${(year.ACC / 30) * 100}%` }}></div>
                      <div className="bg-pink-500" style={{ width: `${(year.GCA / 30) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Events & Training */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">JAL EVENTS & TRAINING</h3>
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <p className="text-gray-600 mb-4">Upcoming Event & Training</p>
                <div className="flex justify-center space-x-4">
                  <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Reference and Theoretical Exams */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Reference */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">QUICK REFERENCE</h3>
              <div className="grid grid-cols-2 gap-4">
                {quickReferenceItems.map((item, index) => (
                  <motion.div 
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer relative"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${item.dot}`}></div>
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Theoretical Exams */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">THEORETICAL EXAMS</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#10b981"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.66)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">66</p>
                      <p className="text-sm text-gray-600">passing average in %</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
