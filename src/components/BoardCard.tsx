import React from 'react';
import Link from 'next/link';

interface BoardCardProps {
  id: string;
  name: string;
  summary: string;
  industries: string[];
  experienceLevels: string[];
  boardType: string[];
  remoteFriendly: boolean;
  featured: boolean;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

const BoardCard: React.FC<BoardCardProps> = ({
  id,
  name,
  summary,
  industries,
  experienceLevels,
  boardType,
  remoteFriendly,
  featured,
  isFavorite,
  onToggleFavorite
}) => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 transition-all hover:border-gray-700 hover:shadow-lg hover:shadow-cyan-900/20">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
          <Link href={`/board/${id}`}>
            {name}
          </Link>
        </h3>
        <button
          onClick={() => onToggleFavorite(id)}
          className="text-gray-400 hover:text-cyan-400 transition-colors"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-cyan-400">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-5.201-3.893 10.406 10.406 0 01-2.325-4.49 6.052 6.052 0 01-.133-1.971 5.051 5.051 0 01.5-1.936 4.927 4.927 0 014.004-2.593 4.981 4.981 0 013.54 1.48l.96.96.96-.96a4.982 4.982 0 013.54-1.48 4.927 4.927 0 014.004 2.593 5.051 5.051 0 01.5 1.936 6.053 6.053 0 01-.133 1.971 10.406 10.406 0 01-2.325 4.49 15.247 15.247 0 01-5.201 3.893l-.022.012-.007.003-.003.001a.75.75 0 01-.694 0l-.003-.001z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          )}
        </button>
      </div>
      
      <p className="text-gray-300 mb-4">{summary}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {industries.map((industry) => (
          <span key={industry} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full">
            {industry}
          </span>
        ))}
        
        {remoteFriendly && (
          <span className="px-2 py-1 bg-cyan-900/30 text-cyan-300 text-xs rounded-full flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
            Remote
          </span>
        )}
        
        {featured && (
          <span className="px-2 py-1 bg-cyan-900/30 text-cyan-300 text-xs rounded-full flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            Recommended
          </span>
        )}
      </div>
      
      <Link 
        href={`/board/${id}`}
        className="inline-block px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
      >
        View
      </Link>
    </div>
  );
};

export default BoardCard;
