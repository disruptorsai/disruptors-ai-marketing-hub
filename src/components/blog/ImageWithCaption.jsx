import React from 'react';
import { motion } from 'framer-motion';

export default function ImageWithCaption({ src, alt, caption }) {
    return (
        <motion.figure
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="my-16"
        >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white ring-2 ring-gray-200 group">
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-auto transform transition-transform duration-300 group-hover:scale-105"
                />
                {caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                        <figcaption className="text-white text-sm font-medium">
                            {caption}
                        </figcaption>
                    </div>
                )}
            </div>
            {caption && !src && (
                <figcaption className="mt-4 text-center text-sm text-gray-600 italic">
                    {caption}
                </figcaption>
            )}
        </motion.figure>
    );
}
