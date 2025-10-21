import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export default function StatsHighlight({ stats }) {
    return (
        <div className="my-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-center text-white shadow-2xl overflow-hidden group hover:scale-105 transition-transform"
                >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                    <TrendingUp className="w-8 h-8 mx-auto mb-4 text-white/80" />
                    <div className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-100">
                        {stat.value}
                    </div>
                    <div className="text-sm font-medium text-indigo-100 uppercase tracking-wider">
                        {stat.label}
                    </div>
                    {stat.description && (
                        <p className="mt-3 text-xs text-indigo-200">
                            {stat.description}
                        </p>
                    )}
                </motion.div>
            ))}
        </div>
    );
}
