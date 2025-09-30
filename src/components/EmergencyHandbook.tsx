'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function EmergencyHandbook() {
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
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-red-600">Emergency Handbook</h2>
              <p className="text-gray-600">Critical procedures and emergency protocols</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Emergency Handbook Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-red-50 border border-red-200 rounded-lg p-6 cursor-pointer"
              onClick={() => handleOpenPDF('emergency-handbook.pdf')}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-red-900">Emergency Handbook Document</h3>
                  <p className="text-red-700">Click to open the emergency procedures PDF</p>
                </div>
                <div className="ml-auto">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Emergency Contacts */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-4">Emergency Contacts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-red-800">Training Emergency:</span>
                    <span className="text-red-600 font-mono">+81-3-XXXX-XXXX</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-red-800">Operations Center:</span>
                    <span className="text-red-600 font-mono">+81-3-XXXX-XXXX</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-red-800">Safety Department:</span>
                    <span className="text-red-600 font-mono">+81-3-XXXX-XXXX</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-red-800">Emergency Email:</span>
                    <span className="text-red-600 text-sm">emergency@jalvirtual.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Emergency Procedures */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Emergency Procedures</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">Training Incident</h4>
                    <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                      <li>Stop training immediately</li>
                      <li>Ensure safety of all participants</li>
                      <li>Contact emergency services if needed</li>
                      <li>Document the incident</li>
                      <li>Notify training supervisor</li>
                    </ol>
                  </div>
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">Equipment Failure</h4>
                    <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                      <li>Stop using failed equipment</li>
                      <li>Switch to backup if available</li>
                      <li>Reschedule training if necessary</li>
                      <li>Report equipment issue</li>
                      <li>Update training records</li>
                    </ol>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">Medical Emergency</h4>
                    <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                      <li>Call emergency services (911)</li>
                      <li>Provide first aid if trained</li>
                      <li>Keep person comfortable</li>
                      <li>Notify family/emergency contact</li>
                      <li>Complete incident report</li>
                    </ol>
                  </div>
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">System Outage</h4>
                    <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                      <li>Check backup systems</li>
                      <li>Contact IT support</li>
                      <li>Reschedule if prolonged</li>
                      <li>Use alternative methods</li>
                      <li>Document downtime</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">Important Notice</h3>
                  <p className="text-yellow-800">
                    This emergency handbook contains critical procedures that must be followed in emergency situations. 
                    All trainers are required to familiarize themselves with these procedures and keep this handbook 
                    accessible during all training sessions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
