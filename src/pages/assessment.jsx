import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Loader } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

const steps = [
  { id: 'size', title: 'Company Size', question: 'How many employees are in your company?', options: ['1–10', '11–50', '51–200', '200+'], type: 'radio' },
  { id: 'channels', title: 'Primary Channels', question: 'What are your primary marketing channels?', options: ['SEO', 'Paid', 'Social', 'Outbound'], type: 'checkbox' },
  { id: 'data', title: 'Data Readiness', question: 'How would you describe your marketing data readiness?', options: ['Low (Siloed, inconsistent)', 'Medium (Centralized but messy)', 'High (Clean, integrated)'], type: 'radio' },
  { id: 'content', title: 'Content Engine Maturity', question: 'How mature is your content creation process?', options: ['Ad-hoc (Reactive)', 'Consistent (Has a calendar)', 'Systematic (Planned & repurposed)'], type: 'radio' },
  { id: 'familiarity', title: 'AI Familiarity', question: 'What is your team\'s familiarity with AI tools?', options: ['New', 'Some', 'Advanced'], type: 'radio' },
  { id: 'governance', title: 'Governance Maturity', question: 'How mature is your AI governance?', options: ['None (No policies)', 'Informal (Verbal rules)', 'Documented (Written policies)'], type: 'radio' },
  { id: 'contact', title: 'Contact', question: 'Where should we send your pilot plan?', type: 'email' },
];

export default function Assessment() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleAnswer = (stepId, value) => {
    setAnswers(prev => ({ ...prev, [stepId]: value }));
  };

  const handleCheckboxAnswer = (stepId, option, checked) => {
    const current = answers[stepId] || [];
    const newAnswers = checked ? [...current, option] : current.filter(item => item !== option);
    handleAnswer(stepId, newAnswers);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };
  
  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentQ = steps[currentStep];

  if (isSubmitted) {
    return (
      <div className="bg-transparent text-white min-h-screen flex items-center justify-center">
        <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="text-center p-8 max-w-2xl">
          <CheckCircle className="w-16 h-16 text-[#FFD700] mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Here’s your 90-day pilot plan.</h1>
          <p className="text-[#C7C7C7] text-lg mb-8">We’ve emailed a PDF to <span className="text-white font-semibold">{answers.contact}</span> with details, including your KPI tree, review gates, and recommended prompts.</p>
          <Button size="lg" className="bg-yellow-500 text-black font-semibold hover:bg-yellow-400 rounded-xl">Book a 30-minute review</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-transparent text-white min-h-screen flex flex-col">
      <div className="w-full bg-[#0E0E0E] border-b border-[#2A2A2A]">
        <div className="h-2 bg-[#FFD700]" style={{ width: `${progress}%`, transition: 'width 0.5s ease' }}></div>
      </div>
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <p className="font-accent text-sm text-[#FFD700] mb-2">Step {currentStep + 1} of {steps.length}</p>
              <h1 className="text-3xl font-bold mb-6">{currentQ.question}</h1>
              
              <form onSubmit={handleSubmit}>
                {currentQ.type === 'radio' && (
                  <RadioGroup onValueChange={(val) => handleAnswer(currentQ.id, val)} value={answers[currentQ.id]}>
                    <div className="space-y-3">
                      {currentQ.options.map(opt => (
                        <Label key={opt} className="flex items-center p-4 bg-[#0E0E0E] border border-[#2A2A2A] rounded-xl cursor-pointer hover:border-[#FFD700]/50 has-[:checked]:border-[#FFD700]">
                          <RadioGroupItem value={opt} id={opt} className="text-[#FFD700] border-[#9CA3AF]" />
                          <span className="ml-4 text-lg">{opt}</span>
                        </Label>
                      ))}
                    </div>
                  </RadioGroup>
                )}

                {currentQ.type === 'checkbox' && (
                   <div className="space-y-3">
                    {currentQ.options.map(opt => (
                      <Label key={opt} className="flex items-center p-4 bg-[#0E0E0E] border border-[#2A2A2A] rounded-xl cursor-pointer hover:border-[#FFD700]/50 has-[:checked]:border-[#FFD700]">
                         <Checkbox 
                           checked={(answers[currentQ.id] || []).includes(opt)}
                           onCheckedChange={(checked) => handleCheckboxAnswer(currentQ.id, opt, checked)}
                           id={opt} 
                           className="data-[state=checked]:bg-[#FFD700] data-[state=checked]:text-black border-[#9CA3AF]" 
                         />
                         <span className="ml-4 text-lg">{opt}</span>
                      </Label>
                    ))}
                  </div>
                )}

                {currentQ.type === 'email' && (
                  <Input 
                    type="email"
                    placeholder="you@company.com"
                    required
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                    className="w-full text-lg p-4 h-auto bg-[#0E0E0E] border-[#2A2A2A] rounded-xl"
                  />
                )}

                <div className="mt-8 flex justify-between items-center">
                  <Button type="button" variant="ghost" onClick={prevStep} disabled={currentStep === 0}>Back</Button>
                  {currentStep < steps.length - 1 ? (
                    <Button type="button" onClick={nextStep} disabled={!answers[currentQ.id] || answers[currentQ.id]?.length === 0}>
                      Next <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button type="submit" className="bg-yellow-500 text-black font-semibold hover:bg-yellow-400" disabled={isSubmitting || !answers[currentQ.id]}>
                      {isSubmitting ? <Loader className="w-4 h-4 animate-spin" /> : "Get My Plan"}
                    </Button>
                  )}
                </div>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}