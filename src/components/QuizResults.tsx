import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

interface Quiz {
  id: string;
  title: string;
  description: string;
  courseId: string;
  instructor: string;
  timeLimit?: number;
  attempts: number;
  gradingMethod: 'highest' | 'average' | 'first' | 'last';
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showCorrectAnswers: boolean;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  questions: QuizQuestion[];
}

interface QuizQuestion {
  id: string;
  quizId: string;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  points: number;
  order: number;
  options: QuizOption[];
  correctAnswer?: string;
  explanation?: string;
}

interface QuizOption {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  order: number;
}

interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  startTime: string;
  endTime?: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  score?: number;
  maxScore: number;
  answers: QuizAnswer[];
  lastSaved: string;
}

interface QuizAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  answerText: string;
  isCorrect?: boolean;
  points?: number;
}

interface Student {
  id: string;
  name: string;
  jalId: string;
  progress: number;
  status: 'enrolled' | 'completed' | 'dropped';
  enrolledAt: string;
  courseId: string;
  quizCompleted?: boolean;
  quizScore?: number;
  quizMaxScore?: number;
}

const QuizResults: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<{name: string, role: string} | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'in_progress' | 'abandoned'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'date'>('name');

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const apiKey = localStorage.getItem('jal_api_key');
        if (!apiKey) return;

        const roleResponse = await fetch(`/api/staff/role?apiKey=${encodeURIComponent(apiKey)}`);
        if (roleResponse.ok) {
          const roleResult = await roleResponse.json();
          if (roleResult.success) {
            setCurrentUser({ name: roleResult.name, role: roleResult.role });
          }
        }
      } catch (error) {
        logger.error('Error loading current user', { 
          message: error instanceof Error ? error.message : String(error) 
        });
      }
    };

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [quizzesResponse, studentsResponse, attemptsResponse] = await Promise.all([
          fetch('/api/quizzes'),
          fetch('/api/students'),
          fetch('/api/quiz-attempts'),
        ]);

        const quizzesResult = await quizzesResponse.json();
        const studentsResult = await studentsResponse.json();
        const attemptsResult = await attemptsResponse.json();

        if (quizzesResult.success) {
          setQuizzes(quizzesResult.quizzes);
        } else {
          logger.error('Failed to fetch quizzes', { error: quizzesResult.error });
        }

        if (studentsResult.success) {
          setStudents(studentsResult.students);
        } else {
          logger.error('Failed to fetch students', { error: studentsResult.error });
        }

        if (attemptsResult.success) {
          setAttempts(attemptsResult.attempts);
        } else {
          logger.error('Failed to fetch quiz attempts', { error: attemptsResult.error });
        }
      } catch (error) {
        logger.error('Error loading quiz results data', {
          message: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
    fetchData();
  }, []);

  const isTrainer = currentUser?.role === 'Trainer' || currentUser?.role === 'Admin';
  const isStudent = currentUser?.role === 'Student' || !isTrainer;

  // Filter attempts based on selected quiz and status
  const filteredAttempts = attempts.filter(attempt => {
    const matchesQuiz = !selectedQuiz || attempt.quizId === selectedQuiz.id;
    const matchesStatus = filterStatus === 'all' || attempt.status === filterStatus;
    const matchesUser = isStudent ? attempt.studentName === currentUser?.name : true;
    return matchesQuiz && matchesStatus && matchesUser;
  });

  // Sort attempts
  const sortedAttempts = [...filteredAttempts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.studentName.localeCompare(b.studentName);
      case 'score':
        return (b.score || 0) - (a.score || 0);
      case 'date':
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
      default:
        return 0;
    }
  });

  // Calculate statistics
  const totalAttempts = filteredAttempts.length;
  const completedAttempts = filteredAttempts.filter(a => a.status === 'completed').length;
  const averageScore = completedAttempts > 0 
    ? Math.round(filteredAttempts
        .filter(a => a.status === 'completed')
        .reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts)
    : 0;
  const passRate = completedAttempts > 0 
    ? Math.round((filteredAttempts
        .filter(a => a.status === 'completed' && (a.score || 0) >= (a.maxScore * 0.7))
        .length / completedAttempts) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
        <div className="flex items-center">
          <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quiz Results</h2>
            <p className="text-gray-600">
              {isTrainer ? 'View and analyze quiz performance' : 'View your quiz results'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          {isTrainer && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Quiz</label>
              <select
                value={selectedQuiz?.id || ''}
                onChange={(e) => {
                  const quiz = quizzes.find(q => q.id === e.target.value);
                  setSelectedQuiz(quiz || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                <option value="">All Quizzes</option>
                {quizzes.map(quiz => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'completed' | 'in_progress' | 'abandoned')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="abandoned">Abandoned</option>
            </select>
          </div>
          
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'score' | 'date')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value="name">Name</option>
              <option value="score">Score</option>
              <option value="date">Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">{totalAttempts}</div>
          <div className="text-sm text-blue-800">Total Attempts</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">{completedAttempts}</div>
          <div className="text-sm text-green-800">Completed</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">{averageScore}</div>
          <div className="text-sm text-purple-800">Average Score</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600 mb-1">{passRate}%</div>
          <div className="text-sm text-yellow-800">Pass Rate</div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {selectedQuiz ? `${selectedQuiz.title} - Results` : 'All Quiz Results'}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {isTrainer && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAttempts.map((attempt) => {
                const quiz = quizzes.find(q => q.id === attempt.quizId);
                const percentage = attempt.maxScore > 0 ? Math.round(((attempt.score || 0) / attempt.maxScore) * 100) : 0;
                
                return (
                  <tr key={attempt.id} className="hover:bg-gray-50">
                    {isTrainer && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {attempt.studentName}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {quiz?.title || 'Unknown Quiz'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        attempt.status === 'completed' ? 'bg-green-100 text-green-800' :
                        attempt.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {attempt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attempt.status === 'completed' ? `${attempt.score || 0} / ${attempt.maxScore}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attempt.status === 'completed' ? `${percentage}%` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(attempt.startTime).toLocaleDateString()} {new Date(attempt.startTime).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {attempt.endTime ? (
                        <>
                          {new Date(attempt.endTime).toLocaleDateString()} {new Date(attempt.endTime).toLocaleTimeString()}
                        </>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          // TODO: View detailed results
                          alert(`Viewing detailed results for ${attempt.studentName}...`);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {sortedAttempts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No quiz attempts found.</p>
          </div>
        )}
      </div>

      {/* Student Progress Summary */}
      {isStudent && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Your Quiz Progress</h3>
          <div className="space-y-4">
            {students
              .filter(student => student.name === currentUser?.name)
              .map(student => (
                <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">Course Progress</h4>
                      <p className="text-sm text-gray-600">Overall training progress</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {student.quizCompleted ? 'Quiz Completed' : 'Quiz Pending'}
                      </div>
                      {student.quizCompleted && student.quizScore !== undefined && (
                        <div className="text-sm text-gray-600">
                          Score: {student.quizScore} / {student.quizMaxScore}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizResults;
