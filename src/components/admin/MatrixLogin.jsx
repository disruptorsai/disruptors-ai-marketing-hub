import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const MatrixLogin = ({ onLogin, onClose }) => {
  const [stage, setStage] = useState('loading'); // loading, username, success, denied
  const [currentText, setCurrentText] = useState('');
  const [username, setUsername] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const inputRef = useRef(null);

  // Allowed admin names
  const ALLOWED_NAMES = ['josh', 'tyler', 'carson', 'will', 'kyle'];

  const digitalMarketingFacts = [
    'AI-powered chatbots handle 85% of customer interactions without human intervention',
    'Personalized email campaigns driven by AI see 760% increase in revenue',
    'Machine learning algorithms can predict customer lifetime value with 95% accuracy',
    'AI content generation tools produce 300% more content in half the time',
    'Programmatic advertising powered by AI reaches the right audience 87% more effectively',
    'Voice search optimization is crucial as 58% of consumers use voice search daily',
    'AI-driven dynamic pricing increases profits by up to 25% in real-time',
    'Predictive analytics help marketers identify high-value leads 3x faster',
    'Computer vision AI can analyze brand sentiment from social media images',
    'Neural networks process 2.5 quintillion bytes of marketing data daily',
    'AI recommendation engines drive 35% of Amazon\'s total revenue',
    'Marketing automation with AI increases qualified leads by 451%',
    'Real-time personalization powered by AI boosts conversion rates by 202%',
    'AI fraud detection prevents $28 billion in ad spend waste annually',
    'Sentiment analysis AI processes 500 million social posts per day'
  ];

  const getRandomFact = () => {
    return digitalMarketingFacts[Math.floor(Math.random() * digitalMarketingFacts.length)];
  };

  const matrixLines = [
    'INITIALIZING SECURE CONNECTION...',
    'ACCESSING DISRUPTORS NEURAL NETWORK...',
    'CONNECTION ESTABLISHED',
    '',
    'STATE YOUR IDENTITY:'
  ];

  const typewriterSpeed = 0.5; // Ultra-fast typing for 0.3s total animation
  const cursorBlinkSpeed = 500;

  // Cursor blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, cursorBlinkSpeed);
    return () => clearInterval(interval);
  }, []);

  // Initial matrix loading sequence
  useEffect(() => {
    if (stage === 'loading') {
      let lineIndex = 0;
      let charIndex = 0;
      let fullText = '';

      const typeMatrix = () => {
        if (lineIndex < matrixLines.length) {
          const currentLine = matrixLines[lineIndex];

          if (charIndex < currentLine.length) {
            fullText += currentLine[charIndex];
            setCurrentText(fullText);
            charIndex++;
            setTimeout(typeMatrix, typewriterSpeed);
          } else {
            fullText += '\n';
            setCurrentText(fullText);
            lineIndex++;
            charIndex = 0;
            setTimeout(typeMatrix, 10); // Minimal delay between lines
          }
        } else {
          setStage('username');
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }, 50);
        }
      };

      setTimeout(typeMatrix, 100); // Start almost immediately
    }
  }, [stage]);

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    const enteredName = username.trim().toLowerCase();

    if (!enteredName) return;

    // Check if name is in allowed list
    if (ALLOWED_NAMES.includes(enteredName)) {
      setCurrentText(prev => prev + username + '\n\nACCESS GRANTED\nIDENTITY VERIFIED\nCREATING SECURE SESSION...\n');
      setStage('success');

      try {
        // Create admin session in Supabase (dynamically import for code splitting)
        const { supabaseMediaStorage } = await import('@/lib/supabase-media-storage');
        const sessionData = await supabaseMediaStorage.createAdminSession(
          enteredName,
          null, // IP will be detected server-side
          navigator.userAgent
        );

        setCurrentText(prev => prev + 'SESSION ESTABLISHED\nWELCOME TO THE SYSTEM, ' + enteredName.toUpperCase() + '\nINITIALIZING ADMIN INTERFACE...\n');

        setTimeout(() => {
          onLogin(enteredName, sessionData);
        }, 2000);

      } catch (error) {
        console.error('Failed to create admin session:', error);
        setCurrentText(prev => prev + 'SESSION ERROR\nFALLBACK AUTHENTICATION ACTIVE\nINITIALIZING ADMIN INTERFACE...\n');

        setTimeout(() => {
          onLogin(enteredName, null); // Login without session
        }, 2000);
      }
    } else {
      // Name not in allowed list
      setCurrentText(prev => prev + username + '\n\nACCESS DENIED\nIDENTITY NOT RECOGNIZED\nUNAUTHORIZED ACCESS ATTEMPT LOGGED\n\nCONNECTION TERMINATED\n');
      setStage('denied');
      setTimeout(() => {
        onClose();
      }, 3000);
    }
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      {/* Animated Background Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-20"
        src="https://res.cloudinary.com/dvcvxhzmt/video/upload/v1759352555/airis_lk5i30.mp4"
        autoPlay
        loop
        muted={isMuted}
        playsInline
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-cyan-500/10" />

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      {/* Audio Controls */}
      <button
        onClick={toggleMute}
        className="absolute top-6 right-6 z-10 p-3 bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 text-slate-300 hover:bg-slate-800/50 hover:border-blue-500/30 transition-all rounded-lg"
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 left-6 z-10 px-4 py-2 bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 text-slate-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all rounded-lg text-sm font-medium"
      >
        ESC
      </button>

      {/* Terminal Interface */}
      <div className="relative z-10 h-full flex items-center justify-center p-8">
        <div className="w-full max-w-4xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-2xl overflow-hidden">

          {/* Terminal Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-800/50 bg-slate-900/50">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-sm font-medium bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Disruptors Neural Net v2.1.4
            </div>
            <div className="text-slate-500 text-xs font-medium">Secure Channel</div>
          </div>

          {/* Terminal Content */}
          <div className="p-8 min-h-[500px] font-mono text-slate-300 bg-slate-950/50">

            {/* Output */}
            <div className="whitespace-pre-wrap leading-relaxed text-sm">
              {currentText}
            </div>

            {/* Input Section */}
            {stage === 'username' && (
              <form onSubmit={handleUsernameSubmit} className="mt-4">
                <div className="flex items-center">
                  <span className="text-blue-400">{'>'} </span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-transparent border-none outline-none text-white font-mono flex-1 ml-2 focus:ring-0"
                    autoComplete="off"
                    spellCheck="false"
                    maxLength={20}
                  />
                  {showCursor && <span className="text-blue-400 animate-pulse">█</span>}
                </div>
              </form>
            )}

            {(stage === 'loading' || stage === 'success') && showCursor && (
              <span className="text-blue-400 animate-pulse">█</span>
            )}

          </div>

          {/* Terminal Footer */}
          <div className="px-8 py-4 border-t border-slate-800/50 bg-slate-900/30 text-xs font-mono text-slate-500 flex justify-between">
            <span>Encrypted Connection Active</span>
            <span>Neural Link: Stable</span>
            <span>Uptime: {new Date().toLocaleTimeString()}</span>
          </div>

        </div>
      </div>

      {/* Modern Styles */}
      <style>{`
        /* Subtle glow on inputs */
        input {
          text-shadow: 0 0 10px rgba(96, 165, 250, 0.3);
        }
      `}</style>
    </div>
  );
};

export default MatrixLogin;