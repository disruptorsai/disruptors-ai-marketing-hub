import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Click-to-play YouTube facade.
 *
 * Renders a poster still plus a play button and only mounts the real <iframe>
 * once the visitor clicks. A live YouTube embed pulls several hundred KB of
 * player JS on every page view even when nobody watches; this keeps that off
 * the wire until it is actually wanted.
 *
 * CSP note: netlify.toml allows `frame-src https://www.youtube.com` only.
 * Do NOT switch to youtube-nocookie.com (not allowed) and do NOT load the
 * IFrame Player API (script-src excludes YouTube) — both would be blocked.
 *
 * @param {string} videoId  YouTube video ID
 * @param {string} poster   Poster image URL (self-hosted; see public/images/)
 * @param {string} title    Accessible title, also used as the iframe title
 * @param {string} className Extra classes for the 16:9 frame
 */
export default function YouTubeFacade({ videoId, poster, title, className = '' }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className={`relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl ${className}`}>
      {playing ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
          style={{ border: 'none' }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 h-full w-full cursor-pointer"
        >
          <img
            src={poster}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
          {/* Scrim so the play button stays legible over any frame */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10 transition-colors duration-300 group-hover:from-black/60" />

          {/* Gold play button — same treatment as the work-page testimonial cards */}
          <span aria-hidden="true" className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center sm:h-20 sm:w-20">
            <motion.span
              className="absolute inset-0 rounded-2xl bg-[#BF953F]/40 blur-xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.35, 0.65, 0.35] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#BF953F] text-[#0b0b0c] shadow-lg transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20">
              <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 sm:h-9 sm:w-9" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
