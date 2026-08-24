import React from 'react';
import { motion } from 'framer-motion';

const defaultPillars = [
  {
    title: "Consultative First",
    description: "We start by understanding your business's struggles, then we create a plan.",
  },
  {
    title: "Individualized & Transparent",
    description: "We'll implement what you need and walk you through every step.",
  },
  {
    title: "AI-Powered Efficiency",
    description: "From lead generation to operations, we automate what slows you down.",
  }
];

export default function ThreePillars({
  title = "We Tailor Every Strategy to the Soul of Your Business.",
  pillars = defaultPillars
}) {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-6 sm:mb-8"
      >
        <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white px-2">{title}</h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {pillars.map((pillar, index) => {
          return (
            <motion.div
              key={pillar.title}
              className="bg-white/10 backdrop-blur-md p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="font-sans text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-white">{pillar.title}</h3>
              <p className="font-sans text-sm sm:text-base text-gray-300 leading-relaxed">{pillar.description}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}