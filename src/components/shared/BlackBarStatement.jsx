import React from 'react';
import { motion } from 'framer-motion';

export default function BlackBarStatement({ children }) {
  return (
    <section className="bg-transparent backdrop-blur-sm text-white py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.p 
          className="text-lg sm:text-2xl font-medium leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {children}
        </motion.p>
      </div>
    </section>
  );
}