'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import UserProfile from '../components/UserProfile';
import WelcomeSection from '../components/WelcomeSection';
import Sidebar from '../components/Sidebar';
import ManageStaff from '../components/ManageStaff';
import TrainingStaffManagement from '../components/TrainingStaffManagement';
import InactivationRequests from '../components/InactivationRequests';
import MyTrainingDashboard from '../components/MyTrainingDashboard';
import PendingTraining from '../components/PendingTraining';
import CompletedTraining from '../components/CompletedTraining';
import QuizActivity from '../components/QuizActivity';
import ApprovalTrainer from '../components/ApprovalTrainer';
import ApprovalExaminer from '../components/ApprovalExaminer';
import TrainingRequestForm from '../components/TrainingRequestForm';
import TrainingTopicsManagement from '../components/TrainingTopicsManagement';
import MyAssignments from '../components/MyAssignments';
import TrainingCalendar from '../components/TrainingCalendar';
import FinishedTraining from '../components/FinishedTraining';
import TrainerGuidelines from '../components/TrainerGuidelines';
import EmergencyHandbook from '../components/EmergencyHandbook';
import Instructions from '../components/Instructions';
import IssueTestToken from '../components/IssueTestToken';
import ComingSoon from '../components/ComingSoon';
import TheoreticalCheckout from '../components/TheoreticalCheckout';
import ThemeToggle from '../components/ThemeToggle';

type SectionKey =
  | 'dashboard'
  | 'manage-staff'
  | 'training-staff-management'
  | 'issue-test-token'
  | 'inactivation-requests'
  | 'my-training'
  | 'examiner-staff-management'
  | 'approved-trainers'
  | 'approved-examiners'
  | 'pending-training'
  | 'completed-training'
  | 'theoretical-check'
  | 'reports-analytics'
  | 'upcoming-training'
  | 'request-exam'
  | 'theoretical-checkout'
  | 'training-request'
  | 'manage-topics'
  | 'my-assignments'
  | 'training-calendar'
  | 'finished-training'
  | 'trainer-guidelines'
  | 'emergency-handbook'
  | 'instructions'
  | 'local-procedures'
  | 'charts'
  | 'training-control'
  | 'pickup-training'
  | 'examination';

export default function DashboardPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionKey>('dashboard');

  useEffect(() => {
    const apiKey = localStorage.getItem('jal_api_key');
    if (!apiKey) {
      router.push('/login');
      return;
    }

    Promise.all([]).finally(() =>
      setIsLoading(false)
    );
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('jal_api_key');
    localStorage.removeItem('jal_pilot_id');
    localStorage.removeItem('jal_user');
    router.push('/login');
  };

  const refreshStaffCounts = async () => {
    // Function kept for compatibility but no longer updates stats
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

  const renderSection = () => {
    switch (activeSection) {
      case 'manage-staff':
        return <ManageStaff onTrainerChange={refreshStaffCounts} />;
      case 'training-staff-management':
        return <TrainingStaffManagement onTrainerChange={refreshStaffCounts} />;
      case 'issue-test-token':
        return <IssueTestToken />;
      case 'inactivation-requests':
        return <InactivationRequests onRequestProcessed={refreshStaffCounts} />;
      case 'my-training':
        return <MyTrainingDashboard />;
      case 'examiner-staff-management':
        return <ManageStaff onTrainerChange={refreshStaffCounts} />;
      case 'approved-trainers':
        return <ApprovalTrainer showAddForm={false} />;
      case 'approved-examiners':
        return <ApprovalExaminer showAddForm={false} />;
      case 'pending-training':
        return <PendingTraining />;
      case 'completed-training':
        return <CompletedTraining />;
      case 'theoretical-check':
        return <QuizActivity />;
      case 'reports-analytics':
        return (
          <ComingSoon
            title="Reports & Analytics"
            description="Training reports and analytics dashboard"
            color="gray"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            }
          />
        );
      case 'upcoming-training':
        return (
          <ComingSoon
            title="Upcoming Training"
            description="View scheduled training sessions"
            color="blue"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
          />
        );
      case 'request-exam':
        return (
          <ComingSoon
            title="Request Exam"
            description="Request examination sessions"
            color="purple"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            }
          />
        );
      case 'theoretical-checkout':
        return <TheoreticalCheckout />;
      case 'training-request':
        return <TrainingRequestForm />;
      case 'manage-topics':
        return <TrainingTopicsManagement />;
      case 'my-assignments':
        return <MyAssignments />;
      case 'training-calendar':
        return <TrainingCalendar />;
      case 'finished-training':
        return <FinishedTraining />;
      case 'trainer-guidelines':
        return <TrainerGuidelines />;
      case 'emergency-handbook':
        return <EmergencyHandbook />;
      case 'instructions':
        return <Instructions />;
      case 'local-procedures':
        return (
          <ComingSoon
            title="Local Procedures"
            description="Access local airport procedures and guidelines"
            color="green"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            }
          />
        );
      case 'charts':
        return (
          <ComingSoon
            title="Charts"
            description="Access aviation charts and navigation aids"
            color="blue"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            }
          />
        );
      case 'training-control':
        return (
          <ComingSoon
            title="Training Control"
            description="Control and manage training operations"
            color="blue"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
          />
        );
      case 'pickup-training':
        return (
          <ComingSoon
            title="Pickup Training"
            description="Schedule and manage pickup training sessions"
            color="green"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            }
          />
        );
      case 'examination':
        return (
          <ComingSoon
            title="Examination Control"
            description="Control and manage examination operations"
            color="purple"
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            }
          />
        );
      default:
        return <WelcomeSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <Sidebar activeSection={activeSection} onSectionChange={(section: SectionKey) => setActiveSection(section)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
              <span className="text-white font-medium dark:text-white">Statistics</span>
              <span className="text-white font-medium dark:text-white">Settings</span>
              <ThemeToggle />
            </div>

            <UserProfile onLogout={handleLogout} />
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-6 space-y-6 bg-gray-50 dark:bg-gray-900">{renderSection()}</div>
      </div>
    </div>
  );
}
