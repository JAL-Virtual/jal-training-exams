import React, { useState, useEffect, useCallback } from 'react';
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


const StudentQuizInterface: React.FC<{ quiz: Quiz }> = ({ quiz }) => {
  const [currentUser, setCurrentUser] = useState<{name: string, role: string} | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);

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

    const startQuizAttempt = async () => {
      try {
        const response = await fetch('/api/quiz-attempts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quizId: quiz.id,
            studentId: currentUser?.name || 'Unknown',
            studentName: currentUser?.name || 'Unknown',
            maxScore: quiz.questions.reduce((sum, q) => sum + q.points, 0)
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setCurrentAttempt(result.attempt);
            
            // Initialize answers from existing attempt
            const existingAnswers: Record<string, string> = {};
            result.attempt.answers.forEach((answer: QuizAnswer) => {
              existingAnswers[answer.questionId] = answer.answerText;
            });
            setAnswers(existingAnswers);
          }
        }
      } catch (error) {
        logger.error('Error starting quiz attempt', {
          message: error instanceof Error ? error.message : String(error)
        });
      }
    };

    const initializeQuiz = async () => {
      await fetchCurrentUser();
      if (currentUser) {
        await startQuizAttempt();
      }
      setIsLoading(false);
    };

    initializeQuiz();
  }, [quiz.id, currentUser, quiz.questions]);

  const handleSubmitQuiz = useCallback(async () => {
    if (!currentAttempt) return;
    try {
      // Calculate score
      let totalScore = 0;
      const gradedAnswers = currentAttempt.answers.map(answer => {
        const question = quiz.questions.find(q => q.id === answer.questionId);
        if (!question) return answer;
        
        let isCorrect = false;
        let points = 0;
        
        if (question.questionType === 'multiple_choice') {
          const correctOption = question.options.find(opt => opt.isCorrect);
          isCorrect = answer.answerText === correctOption?.id;
          points = isCorrect ? question.points : 0;
        } else if (question.questionType === 'true_false') {
          isCorrect = answer.answerText === question.correctAnswer;
          points = isCorrect ? question.points : 0;
        }
        
        totalScore += points;
        return { ...answer, isCorrect, points };
      });

      // Update attempt
      await fetch('/api/quiz-attempts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attemptId: currentAttempt.id,
          status: 'completed',
          endTime: new Date().toISOString(),
          score: totalScore,
          answers: gradedAnswers
        }),
      });

      // Update student progress
      await fetch('/api/students', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: currentUser?.name,
          courseId: quiz.courseId,
          quizCompleted: true,
          quizScore: totalScore,
          quizMaxScore: currentAttempt.maxScore
        }),
      });

      setCurrentAttempt(prev => prev ? {
        ...prev,
        status: 'completed',
        endTime: new Date().toISOString(),
        score: totalScore
      } : null);
      
      setShowSummary(true);
    } catch (error) {
      logger.error('Error submitting quiz', {
        message: error instanceof Error ? error.message : String(error)
      });
      alert('Error submitting quiz. Please try again.');
    }
  }, [currentAttempt, quiz.questions, quiz.courseId, currentUser]);

  // Timer effect
  useEffect(() => {
    if (quiz.timeLimit && currentAttempt && !currentAttempt.endTime) {
      const startTime = new Date(currentAttempt.startTime).getTime();
      const timeLimitMs = quiz.timeLimit * 60 * 1000;
      const endTime = startTime + timeLimitMs;
      
      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          handleSubmitQuiz();
        }
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      
      return () => clearInterval(interval);
    }
  }, [quiz.timeLimit, currentAttempt, handleSubmitQuiz]);

  const saveAnswer = async (questionId: string, answer: string) => {
    if (!currentAttempt) return;
    
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    try {
      await fetch('/api/quiz-attempts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attemptId: currentAttempt.id,
          answers: [...currentAttempt.answers.filter(a => a.questionId !== questionId), {
            questionId,
            answerText: answer
          }]
        }),
      });
    } catch (error) {
      logger.error('Error saving answer', {
        message: error instanceof Error ? error.message : String(error)
      });
    }
  };

  const toggleFlagQuestion = (questionId: string) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showSummary && currentAttempt) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-green-800 mb-2">Quiz Completed!</h2>
          <p className="text-green-700">Your quiz has been submitted successfully.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Results</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-sm text-gray-600">Score:</span>
              <div className="text-2xl font-bold text-blue-600">
                {currentAttempt.score || 0} / {currentAttempt.maxScore}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Percentage:</span>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(((currentAttempt.score || 0) / currentAttempt.maxScore) * 100)}%
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Question Summary:</h4>
            {quiz.questions.map((question, index) => {
              const answer = currentAttempt.answers.find(a => a.questionId === question.id);
              return (
                <div key={question.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Question {index + 1}</span>
                  <span className={`text-sm font-medium ${
                    answer?.isCorrect ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {answer?.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-sm text-gray-600">{quiz.description}</p>
          </div>
          {timeRemaining !== null && (
            <div className="text-right">
              <div className="text-sm text-gray-600">Time Remaining</div>
              <div className={`text-lg font-bold ${
                timeRemaining < 300000 ? 'text-red-600' : 'text-blue-600'
              }`}>
                {formatTime(timeRemaining)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Status Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Question {currentQuestionIndex + 1}</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Status:</span>
                <span className="ml-2 text-blue-600">
                  {answers[currentQuestion.id] ? 'Answered' : 'Not yet answered'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Marked out of {currentQuestion.points} points</span>
              </div>
              <button
                onClick={() => toggleFlagQuestion(currentQuestion.id)}
                className={`flex items-center text-sm ${
                  flaggedQuestions.has(currentQuestion.id) ? 'text-orange-600' : 'text-gray-600'
                }`}
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                Flag question
              </button>
            </div>
          </div>
        </div>

        {/* Question Area */}
        <div className="lg:col-span-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {currentQuestion.questionText}
            </h2>
            
            {currentQuestion.questionType === 'multiple_choice' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Select one:</p>
                {currentQuestion.options.map((option, index) => (
                  <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name={`question_${currentQuestion.id}`}
                      value={option.id}
                      checked={answers[currentQuestion.id] === option.id}
                      onChange={(e) => saveAnswer(currentQuestion.id, e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium">{String.fromCharCode(97 + index)}.</span>
                    <span className="text-gray-900">{option.optionText}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.questionType === 'true_false' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Select one:</p>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question_${currentQuestion.id}`}
                    value="true"
                    checked={answers[currentQuestion.id] === 'true'}
                    onChange={(e) => saveAnswer(currentQuestion.id, e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium">a.</span>
                  <span className="text-gray-900">True</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question_${currentQuestion.id}`}
                    value="false"
                    checked={answers[currentQuestion.id] === 'false'}
                    onChange={(e) => saveAnswer(currentQuestion.id, e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium">b.</span>
                  <span className="text-gray-900">False</span>
                </label>
              </div>
            )}

            {currentQuestion.questionType === 'short_answer' && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Enter your answer:</p>
                <input
                  type="text"
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => saveAnswer(currentQuestion.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Type your answer here..."
                />
              </div>
            )}

            {currentQuestion.questionType === 'essay' && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Enter your answer:</p>
                <textarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => saveAnswer(currentQuestion.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  rows={6}
                  placeholder="Type your answer here..."
                />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            {isLastQuestion ? (
              <button
                onClick={() => setShowSummary(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Finish attempt...
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(Math.min(quiz.questions.length - 1, currentQuestionIndex + 1))}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Quiz Navigation Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Quiz navigation</h3>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-8 h-8 border rounded text-sm font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-blue-600 text-white border-blue-600'
                      : answers[quiz.questions[index].id]
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            <div className="text-xs text-gray-600 mb-3">
              Last saved: {new Date().toLocaleDateString()}, {new Date().toLocaleTimeString()}
            </div>
            
            <button
              onClick={() => setShowSummary(true)}
              className="w-full text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Finish attempt...
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentQuizInterface;
