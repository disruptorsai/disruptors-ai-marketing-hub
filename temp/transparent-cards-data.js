// Data for remaining 6 capability cards in transparent minimal design

export const capabilityCards = [
  // Marketing cards (yellow theme)
  {
    type: 'marketing',
    metric: '300% ROI',
    title: 'Conversion Optimization',
    description: 'Data-driven campaigns designed to turn visitors into customers and maximize ROI',
    icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    delay: 0.2
  },
  {
    type: 'marketing',
    metric: 'Live data',
    title: 'Performance Tracking',
    description: 'Real-time dashboards showing exactly what\'s working and what needs adjustment',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    delay: 0.4
  },
  {
    type: 'marketing',
    metric: 'Qualified leads',
    title: 'Lead Generation',
    description: 'Systematic approach to filling your pipeline with qualified prospects ready to buy',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    delay: 0.6
  },

  // AI cards (white theme)
  {
    type: 'ai',
    metric: 'Smart insights',
    title: 'Predictive Analytics',
    description: 'AI-powered insights that predict customer behavior and optimize your marketing spend',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    delay: 0.3
  },
  {
    type: 'ai',
    metric: '100+ pieces/day',
    title: 'Content at Scale',
    description: 'AI generates high-quality marketing content that converts, from ads to blog posts',
    icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    delay: 0.5
  },
  {
    type: 'ai',
    metric: '20+ hrs saved',
    title: 'Marketing Automation',
    description: 'AI handles repetitive tasks, freeing your team to focus on strategy and relationships',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    delay: 0.7
  }
];

// Marketing card template (yellow theme)
const marketingCardTemplate = (data) => `
              {/* Marketing - ${data.title} */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: ${data.delay} }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-80 group"
              >
                <div className="relative">
                  {/* Icon */}
                  <div className="mb-8">
                    <div className="w-20 h-20 relative">
                      <div className="absolute inset-0 bg-yellow-500/20 rounded-2xl blur-xl group-hover:bg-yellow-500/30 transition-all duration-500" />
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-12 h-12 text-yellow-500 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="${data.icon}" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/50 to-transparent" />
                      <span className="text-yellow-500 text-xs font-bold tracking-[0.2em] uppercase">Marketing</span>
                    </div>

                    <div className="space-y-3">
                      <p className="text-yellow-500/70 text-sm font-semibold tracking-wide uppercase">${data.metric}</p>
                      <h3 className="text-white text-3xl font-bold leading-tight group-hover:text-yellow-500 transition-colors duration-300">
                        ${data.title}
                      </h3>
                      <p className="text-gray-400 text-base leading-relaxed">
                        ${data.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
`;

// AI card template (white theme)
const aiCardTemplate = (data) => `
              {/* AI - ${data.title} */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: ${data.delay} }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-80 group"
              >
                <div className="relative">
                  {/* Icon */}
                  <div className="mb-8">
                    <div className="w-20 h-20 relative">
                      <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl group-hover:bg-white/20 transition-all duration-500" />
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-12 h-12 text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="${data.icon}" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-white/30 to-transparent" />
                      <span className="text-white/70 text-xs font-bold tracking-[0.2em] uppercase">AI Powered</span>
                    </div>

                    <div className="space-y-3">
                      <p className="text-yellow-500 text-sm font-semibold tracking-wide uppercase">${data.metric}</p>
                      <h3 className="text-white text-3xl font-bold leading-tight group-hover:text-yellow-500 transition-colors duration-300">
                        ${data.title}
                      </h3>
                      <p className="text-gray-400 text-base leading-relaxed">
                        ${data.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
`;
