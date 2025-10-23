import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useConnectStore } from '@/lib/connect/store';

// Poll questions from PRD
const POLL_QUESTIONS = [
  {
    id: 'q1',
    question: 'How would you describe your current experience with AI?',
    options: [
      { value: 'A', label: 'I\'ve never used it and barely understand what it does' },
      { value: 'B', label: 'I\'ve tried tools like ChatGPT, but only casually' },
      { value: 'C', label: 'I use AI in some areas of my business' },
      { value: 'D', label: 'I actively use AI systems or automation in my daily work' }
    ]
  },
  {
    id: 'q2',
    question: 'What\'s your biggest goal for using AI in your business?',
    options: [
      { value: 'A', label: 'Save time and streamline repetitive work' },
      { value: 'B', label: 'Generate more leads and marketing content' },
      { value: 'C', label: 'Improve communication or customer service' },
      { value: 'D', label: 'Create entirely new products or services' }
    ]
  },
  {
    id: 'q3',
    question: 'What\'s your biggest hesitation about AI?',
    options: [
      { value: 'A', label: 'It feels overwhelming or confusing' },
      { value: 'B', label: 'I\'m worried it\'ll replace human jobs' },
      { value: 'C', label: 'I don\'t trust it to produce quality work' },
      { value: 'D', label: 'I don\'t have time to learn how to use it' }
    ]
  },
  {
    id: 'q4',
    question: 'How confident are you that you can learn and utilize AI tools yourself?',
    options: [
      { value: 'A', label: 'Not confident — I\'ll need some help' },
      { value: 'B', label: 'Somewhat confident — I\'d need some guidance, but I\'m tech savvy' },
      { value: 'C', label: 'Confident — I just need the right tools, I\'ve got this' },
      { value: 'D', label: 'Very confident — I have already started using AI tools and I\'m good at it' }
    ]
  },
  {
    id: 'q5',
    question: 'Which area of your business do you think AI could impact the most?',
    options: [
      { value: 'A', label: 'Marketing and content creation' },
      { value: 'B', label: 'Operations and workflow automation' },
      { value: 'C', label: 'Sales and customer follow-up' },
      { value: 'D', label: 'Data, reporting, or analytics' }
    ]
  }
];

export default function ConnectPoll() {
  const navigate = useNavigate();
  const { sessionId, updatePollAnswers } = useConnectStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalQuestions = POLL_QUESTIONS.length + 2; // +2 for text questions
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < POLL_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else if (currentQuestion === POLL_QUESTIONS.length - 1) {
      // Move to first text question
      setCurrentQuestion(POLL_QUESTIONS.length);
    } else if (currentQuestion === POLL_QUESTIONS.length) {
      // Move to second text question
      setCurrentQuestion(POLL_QUESTIONS.length + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    updatePollAnswers(answers);

    try {
      const response = await fetch('/.netlify/functions/poll-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: 'connect-2025-10',
          sessionId,
          answers,
          requestId: crypto.randomUUID()
        })
      });

      if (response.ok) {
        navigate('/connectqr/success');
      } else {
        console.error('Poll submission failed');
        // Still navigate to success (poll is optional)
        navigate('/connectqr/success');
      }
    } catch (error) {
      console.error('Poll error:', error);
      navigate('/connectqr/success');
    }
  };

  const renderQuestion = () => {
    if (currentQuestion < POLL_QUESTIONS.length) {
      const q = POLL_QUESTIONS[currentQuestion];
      return (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white mb-8">
            {q.question}
          </h2>
          <div className="space-y-4">
            {q.options.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => handleAnswer(q.id, option.value)}
                className={`
                  w-full p-6 rounded-lg border-2 text-left transition-all
                  flex items-start gap-4 group
                  ${answers[q.id] === option.value
                    ? 'border-cyan-400 bg-cyan-400/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-cyan-400/50'
                  }
                `}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0
                  ${answers[q.id] === option.value
                    ? 'border-cyan-400 bg-cyan-400'
                    : 'border-gray-600'
                  }
                `}>
                  {answers[q.id] === option.value && (
                    <Check className="w-5 h-5 text-black" />
                  )}
                </div>
                <span className="text-lg text-white">{option.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      );
    } else if (currentQuestion === POLL_QUESTIONS.length) {
      return (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white mb-4">
            What are your unfiltered thoughts on AI in general?
          </h2>
          <p className="text-gray-400 mb-6">
            (This is completely anonymous)
          </p>
          <Textarea
            value={answers.q6 || ''}
            onChange={(e) => handleAnswer('q6', e.target.value)}
            placeholder="Share your honest thoughts..."
            className="min-h-40 text-lg bg-gray-800 border-gray-700 text-white"
          />
        </div>
      );
    } else {
      return (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white mb-4">
            What's a task that you find yourself doing over and over again on your computer that you suspect you could (and maybe should) automate with AI?
          </h2>
          <p className="text-gray-400 mb-6">
            (This is also anonymous)
          </p>
          <Textarea
            value={answers.q7 || ''}
            onChange={(e) => handleAnswer('q7', e.target.value)}
            placeholder="Describe the repetitive task..."
            className="min-h-40 text-lg bg-gray-800 border-gray-700 text-white"
          />
        </div>
      );
    }
  };

  const canProceed = currentQuestion < POLL_QUESTIONS.length
    ? answers[POLL_QUESTIONS[currentQuestion].id]
    : true; // Text questions are optional

  return (
    <div className="min-h-screen bg-[#0B0B0F] flex flex-col font-montreal">
      {/* Progress Bar */}
      <div className="bg-gray-900/50 border-b border-gray-800">
        <div className="h-2 bg-gray-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-magenta-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="p-4 text-center">
          <span className="text-gray-400">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="w-full max-w-3xl"
        >
          {renderQuestion()}

          <Button
            onClick={handleNext}
            disabled={!canProceed && currentQuestion < POLL_QUESTIONS.length}
            className="w-full h-16 text-xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-black mt-8"
          >
            {currentQuestion === totalQuestions - 1 ? (
              isSubmitting ? 'Submitting...' : 'Submit & Continue'
            ) : (
              <>
                Next <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>

          {currentQuestion > 0 && (
            <Button
              onClick={() => setCurrentQuestion(prev => prev - 1)}
              variant="ghost"
              className="w-full mt-4 text-gray-400"
            >
              Back
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
