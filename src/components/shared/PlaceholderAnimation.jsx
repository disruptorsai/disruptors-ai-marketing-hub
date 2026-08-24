import React from 'react';
import { Play } from 'lucide-react';

export default function PlaceholderAnimation({ 
  type = "fingers", // "fingers" or "funnel"
  caption = null,
  className = ""
}) {
  const defaultLabel = type === "funnel" 
    ? "[PLACEHOLDER ANIMATION: Dynamic Funnel]" 
    : "[PLACEHOLDER ANIMATION: Fingers + iPhone]";

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 text-center p-8 aspect-video w-full max-w-md flex flex-col items-center justify-center">
        <Play className="w-16 h-16 mb-4" />
        <span className="text-xs font-mono">{caption || defaultLabel}</span>
        <span className="text-xs text-gray-400 mt-2">
          Target: &lt;1.5MB, Lazy-load
        </span>
      </div>
    </div>
  );
}