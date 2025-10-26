import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SCHEDULE = [
  {
    time: '6:00–6:15 PM',
    title: 'Arrival, Food & Networking',
    description: 'Grab food, meet other attendees, and participate in the live poll on the welcome screen. Scan the on-screen QR to answer 5 quick questions + 2 prompts. Results update in real time.'
  },
  {
    time: '6:15–6:30 PM',
    title: 'Welcome & Live Poll',
    speaker: 'Kyle',
    description: '"Tonight isn\'t just about what AI can do — it\'s about what it can do for you." Walkthrough of poll results, quick reactions from the room, and overview of the evening.'
  },
  {
    time: '6:30–6:45 PM',
    title: 'Keynote: Josh Dennis',
    speaker: 'Josh Dennis',
    description: 'Practical examples of AI in action with a short demo or case study (e.g., saving time on admin/ops).'
  },
  {
    time: '6:45–6:55 PM',
    title: 'Audience Q&A',
    speaker: 'with Josh',
    description: 'Rapid-fire questions from the room (and Slido). Goal: Clear, tactical answers you can apply immediately.'
  },
  {
    time: '6:55–7:10 PM',
    title: 'Keynote: Kyle Painter',
    speaker: 'Kyle Painter',
    subtitle: 'The Future of Social Media — and How to Win',
    description: 'How AI amplifies human creativity and brand authenticity, with real examples from the field.'
  },
  {
    time: '7:10–7:25 PM',
    title: 'Panel + Mini Workshop',
    description: '7:10–7:15 Panel Q&A — All speakers on stage. Practical takeaways over technical deep-dives.\n\n7:15–7:25 Breakout Mini Workshop — Split into small groups (one per speaker):\n• Identify a real business challenge\n• Map how AI could solve it using ideas from tonight\n• (Optional) Choose one person to share a quick takeaway'
  },
  {
    time: '7:25–7:30 PM',
    title: 'AI & Business Assessment + Closing',
    description: 'Scan the on-screen QR for a 5-minute self-assessment. You\'ll receive:\n• An AI readiness score\n• 1–3 high-impact opportunities tailored to your business\n• A link to book a free AI Business Audit\n\nClosing notes with links to resources/replay, consultation booking, and community signup.'
  }
];

const SPEAKERS = [
  {
    name: 'Kyle Painter',
    title: 'Founder, Disruptors Media',
    bio: 'AI-powered brand growth and content systems for small businesses.'
  },
  {
    name: 'Josh Dennis',
    title: 'CEO, Emerald Beacon',
    bio: 'Revenue-focused marketing leadership and accountable growth strategy.'
  }
];

export default function ConnectItinerary() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0E0E0E] flex flex-col font-montreal">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-[32rem] h-[32rem] bg-[#FFD700] rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[32rem] h-[32rem] bg-[#FFD700] rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 bg-black/40 border-b border-[#FFD700]/20 p-4 md:p-6 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button
            onClick={() => navigate('/connectqr1')}
            variant="ghost"
            className="text-gray-400 hover:text-[#FFD700] hover:bg-[#FFD700]/10 h-12 px-4 md:px-6 text-base md:text-lg"
          >
            <ArrowLeft className="mr-2 h-5 w-5 md:h-6 md:w-6" />
            <span className="hidden sm:inline">Back to Welcome</span>
            <span className="sm:hidden">Back</span>
          </Button>

          <span className="text-[#FFD700] text-lg md:text-xl font-semibold">Event Schedule</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative z-10 p-4 sm:p-6 md:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Event Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 md:mb-12"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-yellow-400 to-[#FFD700] mb-4">
              Disruptors Connect
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl text-white font-semibold mb-4">
              AI for Business
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-gray-400">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#FFD700]" />
                <span className="text-base md:text-lg">6:00–7:30 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#FFD700]" />
                <span className="text-base md:text-lg">650 N Main St, North Salt Lake, UT 84054</span>
              </div>
            </div>
          </motion.div>

          {/* Schedule */}
          <div className="space-y-4 md:space-y-6 mb-12">
            {SCHEDULE.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-black/60 border-2 border-[#FFD700]/30 rounded-2xl p-5 md:p-6 backdrop-blur-sm hover:border-[#FFD700]/60 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="sm:min-w-[140px]">
                    <div className="inline-flex items-center gap-2 bg-[#FFD700]/20 border border-[#FFD700]/40 rounded-lg px-3 py-2">
                      <Clock className="w-4 h-4 text-[#FFD700]" />
                      <span className="text-[#FFD700] font-semibold text-sm">{item.time}</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-white text-lg md:text-xl font-bold mb-2">
                      {item.title}
                    </h3>

                    {item.subtitle && (
                      <p className="text-[#FFD700] text-base md:text-lg font-semibold mb-2">
                        {item.subtitle}
                      </p>
                    )}

                    {item.speaker && (
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                        <User className="w-4 h-4" />
                        <span>{item.speaker}</span>
                      </div>
                    )}

                    <p className="text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-line">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Speakers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-br from-[#FFD700]/10 to-yellow-600/10 border-2 border-[#FFD700]/30 rounded-2xl p-6 md:p-8 backdrop-blur-sm"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
              Meet the Speakers
            </h2>

            <div className="grid sm:grid-cols-2 gap-6">
              {SPEAKERS.map((speaker, index) => (
                <div key={index} className="text-center">
                  <h3 className="text-[#FFD700] text-xl font-bold mb-2">
                    {speaker.name}
                  </h3>
                  <p className="text-white text-base font-semibold mb-2">
                    {speaker.title}
                  </p>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {speaker.bio}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
