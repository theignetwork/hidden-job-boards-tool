import React from 'react';

interface FilterProps {
  industries: string[];
  selectedIndustries: string[];
  experienceLevels: string[];
  selectedExperienceLevels: string[];
  isRemoteOnly: boolean;
  onIndustryChange: (industry: string) => void;
  onExperienceLevelChange: (level: string) => void;
  onRemoteOnlyChange: (isRemote: boolean) => void;
  onClearFilters: () => void;
  boardsCount: number;
}

const Filters: React.FC<FilterProps> = ({
  industries,
  selectedIndustries,
  experienceLevels,
  selectedExperienceLevels,
  isRemoteOnly,
  onIndustryChange,
  onExperienceLevelChange,
  onRemoteOnlyChange,
  onClearFilters,
  boardsCount
}) => {
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative w-full md:w-1/3">
          <select 
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
            onChange={(e) => {
              const options = e.target.selectedOptions;
              for (let i = 0; i < options.length; i++) {
                onIndustryChange(options[i].value);
              }
            }}
            multiple={false}
          >
            <option value="" disabled selected>Industry</option>
            {industries && industries.map((industry) => (
              <option 
                key={industry} 
                value={industry}
                selected={selectedIndustries && selectedIndustries.includes(industry)}
              >
                {industry}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
        
        <div className="relative w-full md:w-1/3">
          <select 
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
            onChange={(e) => {
              const options = e.target.selectedOptions;
              for (let i = 0; i < options.length; i++) {
                onExperienceLevelChange(options[i].value);
              }
            }}
            multiple={false}
          >
            <option value="" disabled selected>Experience Level</option>
            {experienceLevels && experienceLevels.map((level) => (
              <option 
                key={level} 
                value={level}
                selected={selectedExperienceLevels && selectedExperienceLevels.includes(level)}
              >
                {level}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-white">Remote Only</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={isRemoteOnly}
              onChange={(e) => onRemoteOnlyChange(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
          </label>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <button 
          className={`px-3 py-1 rounded-full text-sm ${(!selectedIndustries || selectedIndustries.length === 0) && (!selectedExperienceLevels || selectedExperienceLevels.length === 0) && !isRemoteOnly ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          onClick={() => onClearFilters()}
        >
          All
        </button>
        
        <button 
          className={`px-3 py-1 rounded-full text-sm ${selectedIndustries && selectedIndustries.includes('startups') ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          onClick={() => onIndustryChange('startups')}
        >
          startups
        </button>
        
        <button 
          className={`px-3 py-1 rounded-full text-sm ${selectedIndustries && selectedIndustries.includes('Nonprofit') ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          onClick={() => onIndustryChange('Nonprofit')}
        >
          Nonprofit
        </button>
        
        <button 
          className={`px-3 py-1 rounded-full text-sm ${selectedIndustries && selectedIndustries.includes('tech') ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          onClick={() => onIndustryChange('tech')}
        >
          tech
        </button>
        
        <button 
          className={`px-3 py-1 rounded-full text-sm ${selectedIndustries && selectedIndustries.includes('climate') ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          onClick={() => onIndustryChange('climate')}
        >
          climate
        </button>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-cyan-400 font-medium">
          {boardsCount} Boards Found
        </div>
        
        {((selectedIndustries && selectedIndustries.length > 0) || (selectedExperienceLevels && selectedExperienceLevels.length > 0) || isRemoteOnly) && (
          <button 
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
            onClick={onClearFilters}
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
};

export default Filters;
