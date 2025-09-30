'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface UpcomingEvent {
  id: string;
  title: string;
  type: 'training' | 'exam' | 'deadline' | 'meeting';
  date: string;
  time: string;
  location?: string;
  instructor?: string;
  status: 'upcoming' | 'today' | 'urgent';
  description: string;
}

export default function UpcomingEventsWidget() {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        // Mock data - in real implementation, fetch from API
        const mockEvents: UpcomingEvent[] = [
          {
            id: '1',
            title: 'Boeing 737-800 Ground School',
            type: 'training',
            date: 'Today',
            time: '09:00 AM',
            location: 'Training Room A',
            instructor: 'Captain Robert Wilson',
            status: 'today',
            description: 'Complete ground school training for Boeing 737-800'
          },
          {
            id: '2',
            title: 'Instrument Rating Exam',
            type: 'exam',
            date: 'Tomorrow',
            time: '02:00 PM',
            location: 'Exam Center',
            instructor: 'Examiner Sarah Johnson',
            status: 'urgent',
            description: 'Final examination for Instrument Rating certification'
          },
          {
            id: '3',
            title: 'Training Request Deadline',
            type: 'deadline',
            date: 'Dec 15',
            time: '11:59 PM',
            status: 'urgent',
            description: 'Submit training requests for January schedule'
          },
          {
            id: '4',
            title: 'Airbus A320 Type Rating',
            type: 'training',
            date: 'Dec 18',
            time: '10:00 AM',
            location: 'Simulator B',
            instructor: 'Captain Mike Chen',
            status: 'upcoming',
            description: 'Type rating training for Airbus A320 aircraft'
          },
          {
            id: '5',
            title: 'Monthly Training Review',
            type: 'meeting',
            date: 'Dec 20',
            time: '03:00 PM',
            location: 'Conference Room',
            instructor: 'Training Manager',
            status: 'upcoming',
            description: 'Monthly review meeting for training progress'
          }
        ];

        setEvents(mockEvents);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching upcoming events:', error);
        setIsLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  const getEventIcon = (type: string) => {
    const icons = {
      training: '📚',
      exam: '📝',
      deadline: '⏰',
      meeting: '👥'
    };
    return icons[type as keyof typeof icons] || '📅';
  };


  const getStatusBadge = (status: string) => {
    const badges = {
      upcoming: 'bg-gray-100 text-gray-600',
      today: 'bg-blue-100 text-blue-600',
      urgent: 'bg-red-100 text-red-600'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-600';
  };

  const getPriorityEvents = () => {
    return events.filter(event => event.status === 'urgent' || event.status === 'today');
  };

  const getUpcomingEvents = () => {
    return events.filter(event => event.status === 'upcoming');
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const priorityEvents = getPriorityEvents();
  const upcomingEvents = getUpcomingEvents();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View Calendar
        </button>
      </div>

      {/* Priority Events */}
      {priorityEvents.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Priority</h4>
          <div className="space-y-3">
            {priorityEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3 p-3 rounded-lg border-l-4 border-red-500 bg-red-50"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-lg">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium text-gray-900">{event.title}</h5>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>{event.date}</span>
                    <span>{event.time}</span>
                    {event.location && <span>{event.location}</span>}
                    {event.instructor && <span>w/ {event.instructor}</span>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Upcoming</h4>
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (priorityEvents.length + index) * 0.1 }}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium text-gray-900">{event.title}</h5>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>{event.date}</span>
                    <span>{event.time}</span>
                    {event.location && <span>{event.location}</span>}
                    {event.instructor && <span>w/ {event.instructor}</span>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">📅</div>
          <p className="text-gray-500">No upcoming events</p>
        </div>
      )}
    </div>
  );
}
