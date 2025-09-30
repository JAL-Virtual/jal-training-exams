'use client';

import React, { useState, useEffect, type FormEvent } from 'react';
import { motion } from 'framer-motion';

interface FormData {
  comments: string;
  studentId: string;
  requestedDate: string;
  requestedTime: string;
}

interface StoredUser {
  id: string;
  name: string;
}

export default function ExamRequestForm() {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({ 
    comments: '', 
    studentId: '', 
    requestedDate: '', 
    requestedTime: '' 
  });
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = () => {
    if (typeof window === 'undefined') return;
    const storedUser = localStorage.getItem('jal_user');
    if (!storedUser) return;
    try {
      const parsed = JSON.parse(storedUser) as StoredUser;
      setUser(parsed);
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.studentId || !formData.requestedDate || !formData.requestedTime) {
      alert('Please fill in all required fields');
      return;
    }
    if (!user) {
      alert('User data not found. Please log in again.');
      return;
    }

    setSubmitting(true);
    try {
      const resp = await fetch('/api/test-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pilotId: user.id,
          pilotName: user.name,
          requestedDate: formData.requestedDate,
          requestedTime: formData.requestedTime,
          comments: formData.comments,
          studentId: formData.studentId,
        }),
      });

      const json = await resp.json().catch(() => ({} as Record<string, unknown>));

      if (resp.ok && json?.success !== false) {
        setFormData({ comments: '', studentId: '', requestedDate: '', requestedTime: '' });
        alert('Exam request submitted successfully');
      } else {
        alert(json?.error || 'Failed to submit exam request');
      }
    } catch (error) {
      console.error('Error submitting exam request:', error);
      alert('An error occurred while submitting the request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Exam</h2>
          <p className="text-gray-600">Submit an exam request for Japan Airlines Virtuals</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date and Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="requestedDate" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Date *
              </label>
              <input
                type="date"
                id="requestedDate"
                value={formData.requestedDate}
                onChange={(e) => setFormData({ ...formData, requestedDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                required
              />
            </div>
            <div>
              <label htmlFor="requestedTime" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Time (Zulu) *
              </label>
              <input
                type="time"
                id="requestedTime"
                value={formData.requestedTime}
                onChange={(e) => setFormData({ ...formData, requestedTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                required
              />
            </div>
          </div>

          {/* JAL ID */}
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
              JAL ID *
            </label>
            <input
              type="text"
              id="studentId"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              required
            />
          </div>

          {/* Comments */}
          <div>
            <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments
            </label>
            <textarea
              id="comments"
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="Any additional information or special requirements..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                submitting
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
