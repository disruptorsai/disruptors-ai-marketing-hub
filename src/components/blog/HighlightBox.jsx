import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, AlertCircle, Info, CheckCircle, Zap } from 'lucide-react';

const iconMap = {
    tip: Lightbulb,
    warning: AlertCircle,
    info: Info,
    success: CheckCircle,
    key: Zap
};

const styleMap = {
    tip: {
        bg: 'bg-gradient-to-br from-amber-50 to-yellow-50',
        border: 'border-amber-300',
        icon: 'text-amber-600',
        title: 'text-amber-900'
    },
    warning: {
        bg: 'bg-gradient-to-br from-red-50 to-orange-50',
        border: 'border-red-300',
        icon: 'text-red-600',
        title: 'text-red-900'
    },
    info: {
        bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
        border: 'border-blue-300',
        icon: 'text-blue-600',
        title: 'text-blue-900'
    },
    success: {
        bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
        border: 'border-green-300',
        icon: 'text-green-600',
        title: 'text-green-900'
    },
    key: {
        bg: 'bg-gradient-to-br from-indigo-50 to-purple-50',
        border: 'border-indigo-300',
        icon: 'text-indigo-600',
        title: 'text-indigo-900'
    }
};

export default function HighlightBox({ type = 'info', title, children }) {
    const Icon = iconMap[type] || Info;
    const styles = styleMap[type] || styleMap.info;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`my-10 p-6 rounded-2xl border-2 ${styles.bg} ${styles.border} shadow-lg`}
        >
            <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 ${styles.icon}`}>
                    <Icon className="w-7 h-7" />
                </div>
                <div className="flex-1">
                    {title && (
                        <h4 className={`text-lg font-bold mb-3 ${styles.title}`}>
                            {title}
                        </h4>
                    )}
                    <div className="prose prose-sm max-w-none text-gray-700">
                        {children}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
