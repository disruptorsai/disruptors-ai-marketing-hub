import React from 'react';

export default function DropCap({ children }) {
    // Extract first letter and rest of text
    const text = children?.toString() || '';
    const firstLetter = text.charAt(0);
    const restOfText = text.slice(1);

    return (
        <p className="text-gray-700 leading-[1.9] mb-8 text-[20px] font-medium">
            <span className="float-left text-8xl font-bold leading-none mr-3 mt-2 bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent select-none">
                {firstLetter}
            </span>
            {restOfText}
        </p>
    );
}
