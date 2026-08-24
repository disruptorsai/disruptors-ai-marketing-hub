import React from 'react';
import { Video, Image, Play, Mic } from 'lucide-react';

export default function Placeholder({ type, label, className = '' }) {
  const baseClasses = "flex flex-col items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 text-center p-4 aspect-[16/9]";
  const combinedClasses = `${baseClasses} ${className}`;

  let icon = <Image className="w-12 h-12 mb-2" />;
  if (type === 'video') icon = <Video className="w-12 h-12 mb-2" />;
  if (type === 'animation') icon = <Play className="w-12 h-12 mb-2" />;
  if (type === 'audio') icon = <Mic className="w-12 h-12 mb-2" />;

  return (
    <div className={combinedClasses}>
      {icon}
      <span className="text-xs font-mono">{label}</span>
    </div>
  );
}