import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function CollapsibleSection({ title, children, defaultOpen = false }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="my-8 border-2 border-indigo-100 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-50/50 to-purple-50/50 shadow-lg hover:shadow-xl transition-shadow">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-indigo-50/50 transition-colors group"
            >
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-700 transition-colors pr-4">
                    {title}
                </h3>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                >
                    {isOpen ? (
                        <ChevronUp className="w-6 h-6 text-indigo-600" />
                    ) : (
                        <ChevronDown className="w-6 h-6 text-indigo-600" />
                    )}
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <div className="px-6 pb-6 pt-2 prose prose-lg max-w-none">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
