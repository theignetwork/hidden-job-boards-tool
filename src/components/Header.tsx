import React from 'react';
import Link from 'next/link';

interface HeaderProps {
  currentBoard?: string;
}

const Header: React.FC<HeaderProps> = ({ currentBoard }) => {
  return (
    <header className="py-8 px-4 md:px-8">
      <h1 className="text-4xl md:text-6xl font-bold text-white text-center mb-2 tracking-wide" style={{ 
        textShadow: '0 0 10px rgba(0, 229, 255, 0.7), 0 0 20px rgba(0, 229, 255, 0.5)' 
      }}>
        HIDDEN JOB BOARDS TOOL
      </h1>
      <h2 className="text-xl md:text-2xl text-gray-300 text-center mb-6">
        Discover Curated Job Boards You Can't Find On Google
      </h2>
      
      {currentBoard && (
        <div className="flex items-center justify-center text-sm md:text-base mb-4">
          <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">
            All job boards
          </Link>
          <span className="mx-2 text-gray-600">/</span>
          <span className="text-cyan-400">{currentBoard}</span>
        </div>
      )}
    </header>
  );
};

export default Header;
