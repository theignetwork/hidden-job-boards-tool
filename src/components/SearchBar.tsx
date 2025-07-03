import React from 'react';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearch: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm, onSearch }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="flex w-full">
      <input
        type="text"
        placeholder="Search by board name, industry, or keyword..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-grow px-4 py-3 bg-gray-900 border border-gray-700 rounded-l-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
      />
      <button
        onClick={onSearch}
        className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-r-lg transition-colors"
        style={{ 
          boxShadow: '0 0 10px rgba(0, 229, 255, 0.3)' 
        }}
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;
