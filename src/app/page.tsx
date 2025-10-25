"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { JobBoard } from '@/lib/supabase';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import Filters from '@/components/Filters';
import Tabs from '@/components/Tabs';
import BoardCard from '@/components/BoardCard';
import Footer from '@/components/Footer';
import { BoardCardSkeletonGrid } from '@/components/BoardCardSkeleton';
import { useJobBoards } from '@/hooks/useJobBoards';
import { useFavorites } from '@/hooks/useFavorites';
import { useDebounce } from '@/hooks/useDebounce';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  const [searchInput, setSearchInput] = useState('');

  const searchParams = useSearchParams();

  // Get userId from URL parameter, fallback to test user ID matching MemberPress format
  const userId = searchParams.get('userId') || '999';

  // Debounce search input to prevent excessive re-renders
  const debouncedSearch = useDebounce(searchInput, 300);

  // Auto-switch to saved tab if URL has ?tab=saved
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'saved') {
      setActiveTab('saved');
    }
  }, [searchParams]);

  const {
    jobBoards,
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
    boardsCount,
    totalBoards,
    loadMore,
    hasMore
  } = useJobBoards(debouncedSearch, [], [], false, userId);

  const { favorites, toggleFavorite, isFavorite } = useFavorites(userId);

  // Set up infinite scroll
  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading: loadingMore,
    threshold: 500
  });

  // All available industries and experience levels for filters
  const allIndustries = ['tech', 'health', 'finance', 'education', 'nonprofit', 'government', 'climate', 'design', 'remote', 'startups'];
  const allExperienceLevels = ['Entry', 'Mid', 'Senior', 'Executive'];

  // Update search term when debounced value changes
  useEffect(() => {
    updateSearchTerm(debouncedSearch);
  }, [debouncedSearch, updateSearchTerm]);

  // Handle search button click
  const handleSearch = () => {
    updateSearchTerm(searchInput);
  };

  // Filter boards based on active tab
  const displayedBoards = activeTab === 'all'
    ? jobBoards
    : jobBoards.filter(board => favorites.includes(board.id));
  
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <Header />
        
        <main className="max-w-6xl mx-auto">
          <div className="mb-8">
            <SearchBar 
              searchTerm={searchInput} 
              setSearchTerm={setSearchInput} 
              onSearch={handleSearch} 
            />
          </div>
          
          <div className="mb-8">
            <Filters 
              industries={allIndustries}
              selectedIndustries={industries}
              experienceLevels={allExperienceLevels}
              selectedExperienceLevels={experienceLevels}
              isRemoteOnly={remoteOnly}
              onIndustryChange={toggleIndustry}
              onExperienceLevelChange={toggleExperienceLevel}
              onRemoteOnlyChange={toggleRemoteOnly}
              onClearFilters={clearFilters}
              boardsCount={activeTab === 'all' ? boardsCount : displayedBoards.length}
            />
          </div>
          
          <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

          {loading ? (
            <BoardCardSkeletonGrid count={12} />
          ) : error ? (
            <div className="text-red-500 text-center py-8">
              {error}
            </div>
          ) : displayedBoards.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                {activeTab === 'all' 
                  ? 'No job boards found matching your filters.' 
                  : 'You haven\'t saved any job boards yet.'}
              </p>
              {activeTab === 'saved' && (
                <button 
                  onClick={() => setActiveTab('all')}
                  className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors"
                >
                  Browse All Boards
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedBoards.map((board) => (
                  <BoardCard
                    key={board.id}
                    id={board.id}
                    name={board.name}
                    summary={board.board_summary}
                    industries={board.industry}
                    experienceLevels={board.experience_level}
                    boardType={board.board_type}
                    remoteFriendly={board.remote_friendly}
                    featured={board.featured}
                    isFavorite={isFavorite(board.id)}
                    onToggleFavorite={toggleFavorite}
                    userId={userId}
                  />
                ))}
              </div>

              {/* Infinite scroll sentinel */}
              {hasMore && (
                <div ref={sentinelRef} className="h-20 flex items-center justify-center">
                  {loadingMore && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-cyan-500"></div>
                      <span>Loading more boards...</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
        
        <Footer />
      </div>
    </div>
  );
}