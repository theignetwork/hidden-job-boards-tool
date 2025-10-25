import { useState, useEffect, useCallback } from 'react';
import { searchJobBoards, JobBoard } from '../lib/supabase';
import { trackSearch } from '../lib/analytics';

const PAGE_SIZE = 50; // Load 50 boards at a time

export const useJobBoards = (
  initialSearchTerm: string = '',
  initialIndustries: string[] = [],
  initialExperienceLevels: string[] = [],
  initialRemoteOnly: boolean = false,
  userId?: string
) => {
  const [allBoards, setAllBoards] = useState<JobBoard[]>([]);
  const [displayedBoards, setDisplayedBoards] = useState<JobBoard[]>([]);
  const [filteredBoards, setFilteredBoards] = useState<JobBoard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);

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

  // Fetch all job boards initially (for filtering)
  useEffect(() => {
    const fetchAllBoards = async () => {
      try {
        setLoading(true);
        const boards = await searchJobBoards();
        setAllBoards(boards);
        setError(null);
      } catch (err) {
        console.error('Error fetching job boards:', err);
        setError('Failed to load job boards');
      } finally {
        setLoading(false);
      }
    };

    fetchAllBoards();
  }, []);

  // Apply filters and pagination
  useEffect(() => {
    const applyFilters = () => {
      try {
        let filtered = [...allBoards];

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

        // Track search event (includes filters)
        if (searchTerm && searchTerm.length >= 3) {
          trackSearch(
            searchTerm,
            {
              industries,
              experienceLevels,
              remoteOnly
            },
            filtered.length,
            userId
          );
        }

        setFilteredBoards(filtered);

        // Reset pagination when filters change
        setPage(1);
        setHasMore(filtered.length > PAGE_SIZE);

        setError(null);
      } catch (err) {
        console.error('Error applying filters:', err);
        setError('Failed to apply filters');
      }
    };

    if (allBoards.length > 0) {
      applyFilters();
    }
  }, [searchTerm, industries, experienceLevels, remoteOnly, allBoards, userId]);

  // Update displayed boards based on current page
  useEffect(() => {
    const startIndex = 0;
    const endIndex = page * PAGE_SIZE;
    setDisplayedBoards(filteredBoards.slice(startIndex, endIndex));
    setHasMore(endIndex < filteredBoards.length);
  }, [page, filteredBoards]);

  // Load more boards (for infinite scroll)
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      // Simulate async load for smooth UX
      setTimeout(() => {
        setPage(prev => prev + 1);
        setLoadingMore(false);
      }, 100);
    }
  }, [loadingMore, hasMore]);

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
    jobBoards: displayedBoards,
    loading,
    loadingMore,
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
    boardsCount: filteredBoards.length,
    totalBoards: allBoards.length,
    loadMore,
    hasMore
  };
};
