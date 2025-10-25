import React from 'react';
import Link from 'next/link';

interface BoardDetailProps {
  id: string;
  name: string;
  summary: string;
  link: string;
  usageTips: string;
  industries: string[];
  remoteFriendly: boolean;
  nonprofit: boolean;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

const BoardDetail: React.FC<BoardDetailProps> = ({
  id,
  name,
  summary,
  link,
  usageTips,
  industries,
  remoteFriendly,
  nonprofit,
  isFavorite,
  onToggleFavorite
}) => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-cyan-700 rounded-full w-16 h-16 flex items-center justify-center mr-4">
            <span className="text-2xl font-bold text-white">{name.charAt(0)}</span>
          </div>
          <h2 className="text-3xl font-bold text-white">{name}</h2>
        </div>
        <button
          onClick={() => onToggleFavorite(id)}
          className="text-gray-400 hover:text-cyan-400 transition-colors"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-cyan-400">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-5.201-3.893 10.406 10.406 0 01-2.325-4.49 6.052 6.052 0 01-.133-1.971 5.051 5.051 0 01.5-1.936 4.927 4.927 0 014.004-2.593 4.981 4.981 0 013.54 1.48l.96.96.96-.96a4.982 4.982 0 013.54-1.48 4.927 4.927 0 014.004 2.593 5.051 5.051 0 01.5 1.936 6.053 6.053 0 01-.133 1.971 10.406 10.406 0 01-2.325 4.49 15.247 15.247 0 01-5.201 3.893l-.022.012-.007.003-.003.001a.75.75 0 01-.694 0l-.003-.001z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          )}
        </button>
      </div>
      
      <p className="text-gray-300 text-lg mb-8">{summary}</p>
      
      <div className="mb-8">
        <a 
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors"
          style={{ 
            boxShadow: '0 0 10px rgba(0, 229, 255, 0.3)' 
          }}
        >
          <span>Open Roles</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      </div>
      
      {usageTips && (
        <div className="mb-8">
          <h3 className="text-cyan-400 text-sm font-bold mb-2">USAGE TIPS</h3>
          <p className="text-gray-300">{usageTips}</p>
        </div>
      )}
      
      <div className="flex flex-wrap gap-2 mb-6">
        {industries.map((industry) => (
          <span key={industry} className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full">
            {industry}
          </span>
        ))}
      </div>
      
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <span className="text-white">Remote-friendly</span>
          <div className={`w-12 h-6 ${remoteFriendly ? 'bg-cyan-600' : 'bg-gray-700'} rounded-full relative`}>
            <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all ${remoteFriendly ? 'right-0.5' : 'left-0.5'}`}></div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-white">Nonprofit</span>
          <div className={`w-12 h-6 ${nonprofit ? 'bg-cyan-600' : 'bg-gray-700'} rounded-full relative`}>
            <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all ${nonprofit ? 'right-0.5' : 'left-0.5'}`}></div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Link 
          href="/?tab=saved"
          className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          View My Boards
        </Link>
        
        <Link 
          href="/"
          className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          View All Boards
        </Link>
      </div>
    </div>
  );
};

export default BoardDetail;
