import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

export default function PullQuote({ children, author, position = 'center' }) {
    const positionClasses = {
        left: 'lg:float-left lg:mr-8 lg:ml-0',
        right: 'lg:float-right lg:ml-8 lg:mr-0',
        center: 'mx-auto'
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`my-12 lg:w-96 ${positionClasses[position]}`}
        >
            <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-8 rounded-2xl shadow-2xl">
                <Quote className="absolute top-4 left-4 w-12 h-12 text-white/20" />
                <Quote className="absolute bottom-4 right-4 w-12 h-12 text-white/20 rotate-180" />

                <blockquote className="relative z-10">
                    <p className="text-xl font-medium leading-relaxed italic mb-4">
                        {children}
                    </p>
                    {author && (
                        <footer className="text-sm text-indigo-200 font-semibold border-t border-white/20 pt-4">
                            — {author}
                        </footer>
                    )}
                </blockquote>
            </div>
        </motion.div>
    );
}
