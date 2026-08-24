import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Check, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TRIVIA_QUESTIONS = [
  {
    id: 1,
    question: "What year was ChatGPT first released?",
    options: ["2020", "2021", "2022", "2023"],
    correctAnswer: 2, // Index of correct answer
    explanation: "ChatGPT was released by OpenAI in November 2022, revolutionizing public access to AI."
  },
  {
    id: 2,
    question: "What does 'GPT' stand for in ChatGPT?",
    options: [
      "General Purpose Technology",
      "Generative Pre-trained Transformer",
      "Global Processing Tool",
      "Guided Prompt Technique"
    ],
    correctAnswer: 1,
    explanation: "GPT stands for Generative Pre-trained Transformer, a type of neural network architecture."
  },
  {
    id: 3,
    question: "Which AI tool specializes in generating images from text descriptions?",
    options: ["DALL-E", "GitHub Copilot", "Grammarly", "Jasper"],
    correctAnswer: 0,
    explanation: "DALL-E, developed by OpenAI, creates images from natural language descriptions."
  },
  {
    id: 4,
    question: "What percentage of marketers say AI helps them create more personalized content?",
    options: ["35%", "52%", "73%", "91%"],
    correctAnswer: 2,
    explanation: "According to recent studies, 73% of marketers report AI significantly improves content personalization."
  },
  {
    id: 5,
    question: "What is 'prompt engineering'?",
    options: [
      "Building AI servers",
      "Coding neural networks",
      "Crafting effective AI instructions",
      "Debugging AI models"
    ],
    correctAnswer: 2,
    explanation: "Prompt engineering is the art of writing clear, effective instructions to get better AI responses."
  }
];

export default function AITrivia() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const question = TRIVIA_QUESTIONS[currentQuestion];
  const isCorrect = selectedAnswer === question.correctAnswer;

  const handleAnswer = (index) => {
    if (showExplanation) return; // Prevent changing answer after selection

    setSelectedAnswer(index);
    setShowExplanation(true);

    if (index === question.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < TRIVIA_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setIsComplete(false);
  };

  if (isComplete) {
    const percentage = Math.round((score / TRIVIA_QUESTIONS.length) * 100);
    let message = "";
    let emoji = "";

    if (percentage >= 80) {
      message = "AI Expert! You're ready to disrupt!";
      emoji = "🚀";
    } else if (percentage >= 60) {
      message = "AI Enthusiast! Keep learning!";
      emoji = "🎯";
    } else {
      message = "AI Curious! Room to grow!";
      emoji = "🌱";
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border border-purple-400/30 rounded-2xl p-8 text-center space-y-6"
      >
        <div className="text-6xl mb-4">{emoji}</div>
        <h3 className="text-3xl font-bold text-white">{message}</h3>
        <div className="space-y-2">
          <p className="text-5xl font-bold text-cyan-400">{score}/{TRIVIA_QUESTIONS.length}</p>
          <p className="text-gray-400 text-lg">Correct Answers</p>
        </div>
        <Button
          onClick={handleRestart}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
        >
          Play Again
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border border-purple-400/30 rounded-2xl p-6 md:p-8 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">AI Trivia Challenge</h3>
            <p className="text-gray-400 text-sm">Test your AI knowledge</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-cyan-400 font-bold text-lg">{score} pts</p>
          <p className="text-gray-500 text-xs">{currentQuestion + 1}/{TRIVIA_QUESTIONS.length}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((currentQuestion + 1) / TRIVIA_QUESTIONS.length) * 100}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <h4 className="text-xl font-semibold text-white leading-relaxed">
            {question.question}
          </h4>

          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectOption = index === question.correctAnswer;
              const showAsCorrect = showExplanation && isCorrectOption;
              const showAsWrong = showExplanation && isSelected && !isCorrect;

              return (
                <motion.button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={showExplanation}
                  whileHover={!showExplanation ? { scale: 1.02 } : {}}
                  whileTap={!showExplanation ? { scale: 0.98 } : {}}
                  className={`
                    w-full p-4 rounded-xl border-2 text-left transition-all
                    flex items-center justify-between gap-3
                    ${showAsCorrect
                      ? 'border-green-500 bg-green-500/10'
                      : showAsWrong
                      ? 'border-red-500 bg-red-500/10'
                      : isSelected
                      ? 'border-cyan-400 bg-cyan-400/10'
                      : 'border-gray-700 bg-gray-800/50 hover:border-purple-400/50'
                    }
                    ${showExplanation ? 'cursor-default' : 'cursor-pointer'}
                  `}
                >
                  <span className="text-white flex-1">{option}</span>
                  {showAsCorrect && (
                    <Check className="w-6 h-6 text-green-500 flex-shrink-0" />
                  )}
                  {showAsWrong && (
                    <X className="w-6 h-6 text-red-500 flex-shrink-0" />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 rounded-xl border-2 ${
                  isCorrect
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                <p className={`font-semibold mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {isCorrect ? '✓ Correct!' : '✗ Not quite!'}
                </p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {question.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next Button */}
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Button
                onClick={handleNext}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
              >
                {currentQuestion < TRIVIA_QUESTIONS.length - 1 ? (
                  <>
                    Next Question <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                ) : (
                  'See Results'
                )}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
