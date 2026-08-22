import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Parses raw text and turns @mentions, #hashtags, and URLs into interactive elements
 */
export const renderRichContent = (text) => {
  if (!text) return null;

  // Regex pattern matching @mentions, #hashtags, or URLs
  const tokenRegex = /(@[a-zA-Z0-9_.-]+|#[a-zA-Z0-9_]+|https?:\/\/[^\s]+)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // 1. @Mention (e.g. @faraz, @ahmad, @subhan)
    if (part.startsWith('@')) {
      const handle = part.slice(1);
      return (
        <Link
          key={index}
          to={`/profile/${handle}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[#0A66C2] dark:text-[#00F0FF] font-semibold hover:underline bg-[#0A66C2]/10 dark:bg-[#00F0FF]/10 px-1.5 py-0.5 rounded-md transition-colors inline-block my-0.5 cursor-pointer"
        >
          {part}
        </Link>
      );
    }

    // 2. #Hashtag (e.g. #react, #javascript, #devhub)
    if (part.startsWith('#')) {
      const tag = part.slice(1);
      return (
        <Link
          key={index}
          to={`/search?q=%23${tag}`}
          onClick={(e) => e.stopPropagation()}
          className="text-purple-600 dark:text-purple-400 font-semibold hover:underline bg-purple-500/10 px-1.5 py-0.5 rounded-md transition-colors inline-block my-0.5 cursor-pointer"
        >
          {part}
        </Link>
      );
    }

    // 3. URLs
    if (part.startsWith('http://') || part.startsWith('https://')) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[#0A66C2] dark:text-[#00F0FF] underline hover:text-blue-700 dark:hover:text-cyan-300 break-all transition-colors cursor-pointer"
        >
          {part}
        </a>
      );
    }

    // Standard plain text
    return <span key={index}>{part}</span>;
  });
};
