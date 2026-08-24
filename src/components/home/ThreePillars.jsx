import React from 'react';
import { motion } from 'framer-motion';

const pillars = [
  { title: "Consultative First", description: "We start by understanding your business’s struggles, then we create a plan." },
  { title: "Individualized & Transparent", description: "We’ll implement what you need and walk you through every step." },
  { title: "AI-Powered Efficiency", description: "From lead generation to operations, we automate what slows you down." }
];

export default function ThreePillars() {
  return (
    <section className="py-16 sm:py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-white drop-shadow-lg">We Tailor Every Strategy to the Soul of Your Business.</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 p-8 rounded-3xl shadow-sm"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-bold mb-4 text-white">{pillar.title}</h3>
              <p className="text-gray-100">{pillar.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}