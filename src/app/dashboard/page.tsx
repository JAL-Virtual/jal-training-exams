'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TrainingStats } from '@/types';
import UserProfile from '@/components/UserProfile';
import WelcomeSection from '@/components/WelcomeSection';
import Sidebar from '@/components/Sidebar';
import ManageStaff from '@/components/ManageStaff';
import ApprovalTrainer from '@/components/ApprovalTrainer';
import ApprovalExaminer from '@/components/ApprovalExaminer';



export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState<TrainingStats>({
    totalTrainingRequested: 15,
    totalTrainingCompleted: 89,
    totalTrainers: 0,
    totalExaminers: 8
  });

  useEffect(() => {
    // Check if user is authenticated
    const apiKey = localStorage.getItem('jal_api_key');
    
    if (!apiKey) {
      router.push('/login');
      return;
    }
    
    // Fetch trainer count
    const fetchTrainerCount = async () => {
      try {
        const response = await fetch('/api/trainers');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats(prev => ({
              ...prev,
              totalTrainers: data.trainers.length
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching trainer count:', error);
      }
    };

    fetchTrainerCount();
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('jal_api_key');
    localStorage.removeItem('jal_pilot_id');
    localStorage.removeItem('jal_user');
    router.push('/login');
  };

  const refreshTrainerCount = async () => {
    try {
      const response = await fetch('/api/trainers');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(prev => ({
            ...prev,
            totalTrainers: data.trainers.length
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching trainer count:', error);
    }
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
      <Sidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

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
          {/* Conditional Content Based on Active Section */}
          {(() => {
            if (activeSection === 'manage-staff') {
              return <ManageStaff onTrainerChange={refreshTrainerCount} />;
            } else if (activeSection === 'training-staff-management') {
              return <ManageStaff onTrainerChange={refreshTrainerCount} />;
            } else if (activeSection === 'examiner-staff-management') {
              return <ManageStaff onTrainerChange={refreshTrainerCount} />;
            } else if (activeSection === 'approved-trainers') {
              return <ApprovalTrainer showAddForm={false} />;
            } else if (activeSection === 'approved-examiners') {
              return <ApprovalExaminer showAddForm={false} />;
            } else if (activeSection === 'my-training') {
              return (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">My Training</h2>
                        <p className="text-gray-600 mt-1">View your assigned training sessions</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">My Training</h3>
                      <p className="text-gray-500 mb-4">This section is currently under development.</p>
                      <p className="text-sm text-gray-400">Your personal training sessions will be displayed here.</p>
                    </div>
                  </div>
                </div>
              );
            } else if (activeSection === 'pending-training') {
              return (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Pending Training</h2>
                        <p className="text-gray-600 mt-1">Training sessions awaiting completion</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Pending Training</h3>
                      <p className="text-gray-500 mb-4">This section is currently under development.</p>
                      <p className="text-sm text-gray-400">Pending training sessions will be listed here.</p>
                    </div>
                  </div>
                </div>
              );
            } else if (activeSection === 'completed-training') {
              return (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Completed Training</h2>
                        <p className="text-gray-600 mt-1">View your completed training sessions</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Completed Training</h3>
                      <p className="text-gray-500 mb-4">This section is currently under development.</p>
                      <p className="text-sm text-gray-400">Your completed training sessions will be displayed here.</p>
                    </div>
                  </div>
                </div>
              );
            } else if (activeSection === 'theoretical-check') {
              return (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Theoretical Check</h2>
                        <p className="text-gray-600 mt-1">Complete theoretical knowledge assessments</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Theoretical Check</h3>
                      <p className="text-gray-500 mb-4">This section is currently under development.</p>
                      <p className="text-sm text-gray-400">Theoretical knowledge assessments will be available here.</p>
                    </div>
                  </div>
                </div>
              );
            } else if (activeSection === 'reports-analytics') {
              return (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
                        <p className="text-gray-600 mt-1">Training reports and analytics dashboard</p>
                      </div>
                    </div>
                  </div>

                  {/* Blank Content Area */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Reports & Analytics</h3>
                      <p className="text-gray-500 mb-4">This section is currently under development.</p>
                      <p className="text-sm text-gray-400">Training reports and analytics will be available here soon.</p>
                    </div>
                  </div>
                </div>
              );
            } else {
              // Default dashboard content
              return (
                <>
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
                </>
              );
            }
          })()}
        </div>
      </div>
    </div>
  );
}
