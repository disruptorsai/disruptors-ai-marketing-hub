import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';

export default function CodeBlock({ children, language = 'javascript', filename }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const code = typeof children === 'string' ? children : children?.props?.children;
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="my-10 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
            {/* Header */}
            <div className="bg-gray-800 px-6 py-3 flex items-center justify-between border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    {filename && (
                        <span className="text-sm text-gray-300 font-mono ml-2">
                            {filename}
                        </span>
                    )}
                    {!filename && language && (
                        <span className="text-xs text-gray-400 uppercase tracking-wider ml-2">
                            {language}
                        </span>
                    )}
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                >
                    {copied ? (
                        <>
                            <Check className="w-4 h-4" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4" />
                            Copy
                        </>
                    )}
                </motion.button>
            </div>

            {/* Code Content */}
            <div className="bg-gray-900 p-6 overflow-x-auto">
                <pre className="text-gray-100 text-sm font-mono leading-relaxed">
                    {children}
                </pre>
            </div>
        </div>
    );
}
