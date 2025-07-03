import React from 'react';

interface TabsProps {
  activeTab: 'all' | 'saved';
  onTabChange: (tab: 'all' | 'saved') => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex border-b border-gray-800 mb-6">
      <button
        className={`px-6 py-3 font-medium text-sm transition-colors ${
          activeTab === 'all'
            ? 'text-cyan-400 border-b-2 border-cyan-400'
            : 'text-gray-400 hover:text-gray-300'
        }`}
        onClick={() => onTabChange('all')}
      >
        All Boards
      </button>
      <button
        className={`px-6 py-3 font-medium text-sm transition-colors ${
          activeTab === 'saved'
            ? 'text-cyan-400 border-b-2 border-cyan-400'
            : 'text-gray-400 hover:text-gray-300'
        }`}
        onClick={() => onTabChange('saved')}
      >
        My Saved Boards
      </button>
    </div>
  );
};

export default Tabs;
