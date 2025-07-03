import { useState, useEffect } from 'react';
import { searchJobBoards, JobBoard } from '../lib/supabase';

export const useJobBoards = (
  initialSearchTerm: string = '',
  initialIndustries: string[] = [],
  initialExperienceLevels: string[] = [],
  initialRemoteOnly: boolean = false
) => {
  const [jobBoards, setJobBoards] = useState<JobBoard[]>([]);
  const [filteredBoards, setFilteredBoards] = useState<JobBoard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);
  const [industries, setIndustries] = useState<string[]>(initialIndustries);
  const [experienceLevels, setExperienceLevels] = useState<string[]>(initialExperienceLevels);
  const [remoteOnly, setRemoteOnly] = useState<boolean>(initialRemoteOnly);

  // Helper function to expand health-related terms
  const expandIndustryTerms = (selectedIndustries: string[]): string[] => {
    const expandedTerms: string[] = [];
    
    selectedIndustries.forEach(industry => {
      if (industry === 'health') {
        // Add all health-related terms
        expandedTerms.push('health', 'healthcare', 'Health', 'medical', 'clinical', 'biotech', 'clinical research', 'hospital', 'pharmaceutical', 'pharma');
      } else {
        expandedTerms.push(industry);
      }
    });
    
    return expandedTerms;
  };

  // Fetch all job boards initially
  useEffect(() => {
    const fetchJobBoards = async () => {
      try {
        setLoading(true);
        const boards = await searchJobBoards();
        setJobBoards(boards);
        setFilteredBoards(boards);
        setError(null);
      } catch (err) {
        console.error('Error fetching job boards:', err);
        setError('Failed to load job boards');
      } finally {
        setLoading(false);
      }
    };

    fetchJobBoards();
  }, []);

  // Apply filters when filter state changes
  useEffect(() => {
    const applyFilters = () => {
      try {
        setLoading(true);
        
        let filtered = [...jobBoards];
        
        // Apply search term filter
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filtered = filtered.filter(board => 
            board.name.toLowerCase().includes(term) || 
            board.board_summary.toLowerCase().includes(term) ||
            board.tags.some(tag => tag.toLowerCase().includes(term))
          );
        }
        
        // Apply industry filter with expanded terms
        if (industries.length > 0) {
          const expandedTerms = expandIndustryTerms(industries);
          filtered = filtered.filter(board => 
            board.industry.some(ind => 
              expandedTerms.some(term => 
                ind.toLowerCase().includes(term.toLowerCase()) ||
                term.toLowerCase().includes(ind.toLowerCase())
              )
            )
          );
        }
        
        // Apply experience level filter
        if (experienceLevels.length > 0) {
          filtered = filtered.filter(board => 
            board.experience_level.some(level => experienceLevels.includes(level))
          );
        }
        
        // Apply remote only filter
        if (remoteOnly) {
          filtered = filtered.filter(board => board.remote_friendly);
        }
        
        setFilteredBoards(filtered);
        setError(null);
      } catch (err) {
        console.error('Error applying filters:', err);
        setError('Failed to apply filters');
      } finally {
        setLoading(false);
      }
    };

    applyFilters();
  }, [searchTerm, industries, experienceLevels, remoteOnly, jobBoards]);

  const updateSearchTerm = (term: string) => {
    setSearchTerm(term);
  };

  const toggleIndustry = (industry: string) => {
    if (industries.includes(industry)) {
      setIndustries(industries.filter(i => i !== industry));
    } else {
      setIndustries([...industries, industry]);
    }
  };

  const toggleExperienceLevel = (level: string) => {
    if (experienceLevels.includes(level)) {
      setExperienceLevels(experienceLevels.filter(l => l !== level));
    } else {
      setExperienceLevels([...experienceLevels, level]);
    }
  };

  const toggleRemoteOnly = () => {
    setRemoteOnly(!remoteOnly);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setIndustries([]);
    setExperienceLevels([]);
    setRemoteOnly(false);
  };

  return {
    jobBoards: filteredBoards,
    loading,
    error,
    searchTerm,
    industries,
    experienceLevels,
    remoteOnly,
    updateSearchTerm,
    toggleIndustry,
    toggleExperienceLevel,
    toggleRemoteOnly,
    clearFilters,
    boardsCount: filteredBoards.length
  };
};