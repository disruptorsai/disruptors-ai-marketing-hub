import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Twitter, Linkedin, Facebook, Link, Check } from 'lucide-react';

export default function SocialShare({ title, url }) {
    const [copied, setCopied] = useState(false);

    const shareUrl = url || window.location.href;
    const shareText = encodeURIComponent(title || document.title);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const socialPlatforms = [
        {
            name: 'Twitter',
            icon: Twitter,
            url: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
            color: 'hover:bg-blue-400'
        },
        {
            name: 'LinkedIn',
            icon: Linkedin,
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
            color: 'hover:bg-blue-600'
        },
        {
            name: 'Facebook',
            icon: Facebook,
            url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
            color: 'hover:bg-blue-500'
        }
    ];

    return (
        <div className="my-12 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl p-8 border-2 border-indigo-100">
            <div className="flex items-center gap-3 mb-6">
                <Share2 className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-900">Share this article</h3>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {socialPlatforms.map((platform) => (
                    <motion.a
                        key={platform.name}
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-xl border-2 border-gray-200 ${platform.color} hover:text-white transition-all shadow-sm hover:shadow-md font-medium`}
                    >
                        <platform.icon className="w-5 h-5" />
                        {platform.name}
                    </motion.a>
                ))}

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-xl border-2 border-gray-200 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all shadow-sm hover:shadow-md font-medium"
                >
                    {copied ? (
                        <>
                            <Check className="w-5 h-5" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Link className="w-5 h-5" />
                            Copy Link
                        </>
                    )}
                </motion.button>
            </div>
        </div>
    );
}
