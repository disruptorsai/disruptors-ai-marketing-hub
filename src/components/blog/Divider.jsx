import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function Divider({ variant = 'default' }) {
    if (variant === 'sparkles') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="flex items-center justify-center my-20"
            >
                <Sparkles className="w-8 h-8 text-indigo-400" />
                <div className="h-px w-32 bg-gradient-to-r from-indigo-300 to-purple-300 mx-4" />
                <Sparkles className="w-8 h-8 text-purple-400" />
            </motion.div>
        );
    }

    if (variant === 'gradient') {
        return (
            <div className="my-20">
                <div className="h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent rounded-full" />
            </div>
        );
    }

    if (variant === 'dots') {
        return (
            <div className="flex items-center justify-center gap-3 my-20">
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <div className="w-2 h-2 rounded-full bg-purple-500" />
            </div>
        );
    }

    return (
        <div className="my-20 border-0 h-1 bg-gradient-to-r from-transparent via-indigo-300 to-transparent" />
    );
}
