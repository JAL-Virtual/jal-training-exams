'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TrainingStats } from '../../types';
import { Student } from '../../types/common';
import UserProfile from '../../components/UserProfile';
import WelcomeSection from '../../components/WelcomeSection';
import Sidebar from '../../components/Sidebar';
import ManageStaff from '../../components/ManageStaff';
import TrainingStaffManagement from '../../components/TrainingStaffManagement';
import InactivationRequests from '../../components/InactivationRequests';
import MyTrainingDashboard from '../../components/MyTrainingDashboard';
import PendingTraining from '../../components/PendingTraining';
import CompletedTraining from '../../components/CompletedTraining';
import QuizActivity from '../../components/QuizActivity';
import ApprovalTrainer from '../../components/ApprovalTrainer';
import ApprovalExaminer from '../../components/ApprovalExaminer';
import TrainingRequestForm from '../../components/TrainingRequestForm';
import TrainingTopicsManagement from '../../components/TrainingTopicsManagement';
import MyAssignments from '../../components/MyAssignments';
import TrainingCalendar from '../../components/TrainingCalendar';
import FinishedTraining from '../../components/FinishedTraining';
import TrainerGuidelines from '../../components/TrainerGuidelines';
import EmergencyHandbook from '../../components/EmergencyHandbook';
import Instructions from '../../components/Instructions';
import IssueTestToken from '../../components/IssueTestToken';
import ComingSoon from '../../components/ComingSoon';
import TheoreticalCheckout from '../../components/TheoreticalCheckout';

// Removed unused interface DashboardData

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState<TrainingStats>({
    totalTrainingRequested: 0,
    totalTrainingCompleted: 0,
    totalTrainers: 0,
    totalExaminers: 0
  });

  useEffect(() => {
    // Check if user is authenticated
    const apiKey = localStorage.getItem('jal_api_key');
    
    if (!apiKey) {
      router.push('/login');
      return;
    }
    
    // Fetch training statistics
    const fetchTrainingStats = async () => {
      try {
        const response = await fetch('/api/students');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const students = data.students;
            const totalRequested = students.length; // All student enrollments
            const totalCompleted = students.filter((student: Student) => student.status === 'completed').length;
            
            setStats(prev => ({
              ...prev,
              totalTrainingRequested: totalRequested,
              totalTrainingCompleted: totalCompleted
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching training stats:', error);
      }
    };

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

    // Fetch examiner count
    const fetchExaminerCount = async () => {
      try {
        const response = await fetch('/api/examiners');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats(prev => ({
              ...prev,
              totalExaminers: data.examiners.length
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching examiner count:', error);
      }
    };

    fetchTrainingStats();
    fetchTrainerCount();
    fetchExaminerCount();
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('jal_api_key');
    localStorage.removeItem('jal_pilot_id');
    localStorage.removeItem('jal_user');
    router.push('/login');
  };

  const refreshStaffCounts = async () => {
    try {
      // Fetch training statistics
      const studentsResponse = await fetch('/api/students');
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        if (studentsData.success) {
          const students = studentsData.students;
          const totalRequested = students.length;
          const totalCompleted = students.filter((student: Student) => student.status === 'completed').length;
          
          setStats(prev => ({
            ...prev,
            totalTrainingRequested: totalRequested,
            totalTrainingCompleted: totalCompleted
          }));
        }
      }

      // Fetch trainer count
      const trainerResponse = await fetch('/api/trainers');
      if (trainerResponse.ok) {
        const trainerData = await trainerResponse.json();
        if (trainerData.success) {
          setStats(prev => ({
            ...prev,
            totalTrainers: trainerData.trainers.length
          }));
        }
      }

      // Fetch examiner count
      const examinerResponse = await fetch('/api/examiners');
      if (examinerResponse.ok) {
        const examinerData = await examinerResponse.json();
        if (examinerData.success) {
          setStats(prev => ({
            ...prev,
            totalExaminers: examinerData.examiners.length
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching staff counts:', error);
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
              return <ManageStaff onTrainerChange={refreshStaffCounts} />;
            } else if (activeSection === 'training-staff-management') {
              return <TrainingStaffManagement onTrainerChange={refreshStaffCounts} />;
            } else if (activeSection === 'issue-test-token') {
              return <IssueTestToken />;
        } else if (activeSection === 'inactivation-requests') {
          return <InactivationRequests onRequestProcessed={refreshStaffCounts} />;
        } else if (activeSection === 'my-training') {
          return <MyTrainingDashboard />;
        } else if (activeSection === 'examiner-staff-management') {
              return <ManageStaff onTrainerChange={refreshStaffCounts} />;
            } else if (activeSection === 'approved-trainers') {
              return <ApprovalTrainer showAddForm={false} />;
            } else if (activeSection === 'approved-examiners') {
              return <ApprovalExaminer showAddForm={false} />;
            } else if (activeSection === 'my-training') {
              return (
                <ComingSoon 
                  title="My Training" 
                  description="View your assigned training sessions"
                  color="blue"
                  icon={
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />
              );
            } else if (activeSection === 'pending-training') {
              return <PendingTraining />;
            } else if (activeSection === 'completed-training') {
              return <CompletedTraining />;
            } else if (activeSection === 'theoretical-check') {
              return <QuizActivity />;
            } else if (activeSection === 'reports-analytics') {
              return (
                <ComingSoon 
                  title="Reports & Analytics" 
                  description="Training reports and analytics dashboard"
                  color="gray"
                  icon={
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  }
                />
              );
            } else if (activeSection === 'upcoming-training') {
              return (
                <ComingSoon 
                  title="Upcoming Training" 
                  description="View scheduled training sessions"
                  color="blue"
                  icon={
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                />
              );
            } else if (activeSection === 'request-exam') {
              return (
                <ComingSoon 
                  title="Request Exam" 
                  description="Request examination sessions"
                  color="purple"
                  icon={
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  }
                />
              );
            } else if (activeSection === 'theoretical-checkout') {
              return <TheoreticalCheckout />;
            } else if (activeSection === 'training-request') {
              return <TrainingRequestForm />;
            } else if (activeSection === 'manage-topics') {
              return <TrainingTopicsManagement />;
            } else if (activeSection === 'my-assignments') {
              return <MyAssignments />;
            } else if (activeSection === 'training-calendar') {
              return <TrainingCalendar />;
            } else if (activeSection === 'finished-training') {
              return <FinishedTraining />;
            } else if (activeSection === 'trainer-guidelines') {
              return <TrainerGuidelines />;
            } else if (activeSection === 'emergency-handbook') {
              return <EmergencyHandbook />;
            } else if (activeSection === 'instructions') {
              return <Instructions />;
            } else if (activeSection === 'local-procedures') {
              return (
                <ComingSoon 
                  title="Local Procedures" 
                  description="Access local airport procedures and guidelines"
                  color="green"
                  icon={
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  }
                />
              );
            } else if (activeSection === 'charts') {
              return (
                <ComingSoon 
                  title="Charts" 
                  description="Access aviation charts and navigation aids"
                  color="blue"
                  icon={
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  }
                />
              );
            } else if (activeSection === 'training-control') {
              return (
                <ComingSoon 
                  title="Training Control" 
                  description="Control and manage training operations"
                  color="blue"
                  icon={
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                />
              );
            } else if (activeSection === 'pickup-training') {
              return (
                <ComingSoon 
                  title="Pickup Training" 
                  description="Schedule and manage pickup training sessions"
                  color="green"
                  icon={
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  }
                />
              );
            } else if (activeSection === 'examination') {
              return (
                <ComingSoon 
                  title="Examination Control" 
                  description="Control and manage examination operations"
                  color="purple"
                  icon={
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  }
                />
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
    </div>  );}// Example fixes for `any`:const handleSomething = (event: React.MouseEvent<HTMLButtonElement>) => { /* ... */ }// If you have a function like:const processData = (data: unknown) => { /* ... */ }