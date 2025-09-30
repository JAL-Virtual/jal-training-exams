'use client';

import React, { useState, useEffect, type FormEvent } from 'react';
import { motion } from 'framer-motion';

interface TrainingTopic {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

interface FormData {
  type: string;       // topicId
  comments: string;
  studentId: string;
}

interface StoredUser {
  id: string;
  name: string;
}

export default function TrainingRequestForm() {
  const [topics, setTopics] = useState<TrainingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({ type: '', comments: '', studentId: '' });
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    fetchTopics();
    fetchUserData();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/training-topics');
      if (!response.ok) throw new Error('Failed to fetch topics');
      const json = await response.json();
      if (json?.success && Array.isArray(json.topics)) {
        setTopics(json.topics.filter((t: TrainingTopic) => t.active));
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

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

    if (!formData.type || !formData.studentId) {
      alert('Please fill in all required fields');
      return;
    }
    if (!user) {
      alert('User data not found. Please log in again.');
      return;
    }

    setSubmitting(true);
    try {
      const selectedTopic = topics.find(t => t.id === formData.type);

      const resp = await fetch('/api/training-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pilotId: user.id,
          pilotName: user.name,
          topicId: formData.type,
          topicName: selectedTopic?.name ?? '',
          requestedDate: new Date().toISOString().split('T')[0],
          requestedTime: new Date().toISOString().split('T')[1].substring(0, 5),
          comments: formData.comments,
          studentId: formData.studentId,
        }),
      });

      const json = await resp.json().catch(() => ({} as Record<string, unknown>));

      if (resp.ok && json?.success !== false) {
        setFormData({ type: '', comments: '', studentId: '' });
        alert('Training request submitted successfully');
      } else {
        alert(json?.error || 'Failed to submit training request');
      }
    } catch (error) {
      console.error('Error submitting training request:', error);
      alert('An error occurred while submitting the request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Training</h2>
          <p className="text-gray-600">Submit a training request for Japan Airlines Virtuals</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Topic Selection */}
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
              Training Topic *
            </label>
            <select
              id="topic"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              required
            >
              <option value="">Select a training topic</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
            {formData.type && (
              <p className="mt-1 text-sm text-gray-500">
                {topics.find(t => t.id === formData.type)?.description}
              </p>
            )}
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

        {/* User Info */}
        {user && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Requesting as:</h3>
            <p className="text-sm text-gray-600">
              <strong>{user.name}</strong> (JAL ID: {user.id})
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
