'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function Instructions() {
  const handleOpenPDF = (filename: string) => {
    // In a real application, this would open the actual PDF file
    // For now, we'll show an alert
    alert(`Opening ${filename} - This would open the PDF in a new tab`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Instructions of the Exam System</h2>
          <p className="text-gray-600">Comprehensive guide to the JAL Virtual Training and Examination System</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Main Instructions Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-6 cursor-pointer"
              onClick={() => handleOpenPDF('exam-system-instructions.pdf')}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-blue-900">Complete System Instructions</h3>
                  <p className="text-blue-700">Click to open the full examination system instructions PDF</p>
                </div>
                <div className="ml-auto">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* System Overview */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">Training Request Process</h4>
                    <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                      <li>Select training topic from available options</li>
                      <li>Choose preferred date and time (Zulu)</li>
                      <li>Add any special comments or requirements</li>
                      <li>Submit request for trainer assignment</li>
                      <li>Wait for confirmation and trainer assignment</li>
                    </ol>
                  </div>
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">Examination Process</h4>
                    <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                      <li>Complete required training sessions</li>
                      <li>Request examination through the system</li>
                      <li>Receive examination token</li>
                      <li>Complete examination within time limit</li>
                      <li>Receive results and certification</li>
                    </ol>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">User Roles</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <strong>Pilots:</strong> Request training and take examinations</li>
                      <li>• <strong>Trainers:</strong> Conduct training sessions and evaluations</li>
                      <li>• <strong>Examiners:</strong> Administer examinations and assessments</li>
                      <li>• <strong>Administrators:</strong> Manage system and user accounts</li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">Key Features</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Calendar-based training scheduling</li>
                      <li>• Zulu time standardization</li>
                      <li>• Automated trainer assignment</li>
                      <li>• Progress tracking and reporting</li>
                      <li>• Digital certification system</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Start Guide */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Quick Start Guide</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 font-bold text-lg">1</span>
                  </div>
                  <h4 className="font-semibold text-green-800 mb-2">Login</h4>
                  <p className="text-sm text-green-700">Use your JAL Virtual API key to access the system</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 font-bold text-lg">2</span>
                  </div>
                  <h4 className="font-semibold text-green-800 mb-2">Request Training</h4>
                  <p className="text-sm text-green-700">Select topic, date, and time for your training session</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 font-bold text-lg">3</span>
                  </div>
                  <h4 className="font-semibold text-green-800 mb-2">Complete Training</h4>
                  <p className="text-sm text-green-700">Attend your assigned training and receive evaluation</p>
                </div>
              </div>
            </div>

            {/* Support Information */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Need Help?</h3>
              <p className="text-yellow-800 mb-3">
                If you encounter any issues or have questions about the system, please refer to the complete 
                instructions document above or contact our support team.
              </p>
              <div className="flex items-center text-yellow-800">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>support@jalvirtual.com</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
