import React from 'react';
import { JobBoard } from '../lib/supabase';

// Mock data for testing the UI without Supabase connection
export const mockJobBoards: JobBoard[] = [
  {
    id: '1',
    name: 'AngelList Talent',
    industry: ['tech', 'startups'],
    experience_level: ['Entry', 'Mid', 'Senior'],
    remote_friendly: true,
    board_type: ['startups'],
    link: 'https://angel.co/jobs',
    usage_tips: 'Tailor your profile to tech startups and follow companies you\'re interested in to get invited to exclusive roles.',
    tags: ['tech', 'startups', 'venture-backed'],
    board_summary: 'A go-to job board for discovering opportunities at tech startups and emerging companies.',
    created_at: '2025-01-01T00:00:00Z',
    featured: true
  },
  {
    id: '2',
    name: 'ClimateBase',
    industry: ['climate', 'cleantech'],
    experience_level: ['Mid', 'Senior'],
    remote_friendly: true,
    board_type: ['Nonprofit', 'startups'],
    link: 'https://climatebase.org/jobs',
    usage_tips: 'Tailor your profile to climate-focused skills and follow mission-aligned orgs to get invited to exclusive roles.',
    tags: ['climate', 'cleantech', 'sustainability'],
    board_summary: 'Showcase climate-focused skills for roles at mission-aligned organizations tackling global environmental challenges.',
    created_at: '2025-01-02T00:00:00Z',
    featured: true
  },
  {
    id: '3',
    name: 'CryptoJobsList',
    industry: ['crypto', 'blockchain'],
    experience_level: ['Mid', 'Senior'],
    remote_friendly: true,
    board_type: ['startups', 'niche'],
    link: 'https://cryptojobslist.com',
    usage_tips: 'Highlight any blockchain experience or projects, even if they were personal or educational.',
    tags: ['crypto', 'blockchain', 'web3'],
    board_summary: 'A leading platform particularly helpful for job-specific positions in the crypto & blockchain sectors.',
    created_at: '2025-01-03T00:00:00Z',
    featured: false
  }
];

// Mock user favorites for testing
export const mockUserFavorites: string[] = ['1', '2'];

// Mock function to simulate Supabase API calls
export const mockSupabaseClient = {
  getJobBoards: async (): Promise<JobBoard[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockJobBoards), 500);
    });
  },
  
  getUserFavorites: async (userId: string): Promise<string[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockUserFavorites), 300);
    });
  },
  
  addFavorite: async (userId: string, boardId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 200);
    });
  },
  
  removeFavorite: async (userId: string, boardId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 200);
    });
  },
  
  searchJobBoards: async (
    searchTerm: string = '',
    industries: string[] = [],
    experienceLevels: string[] = [],
    remoteOnly: boolean = false
  ): Promise<JobBoard[]> => {
    return new Promise((resolve) => {
      let filtered = [...mockJobBoards];
      
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(board => 
          board.name.toLowerCase().includes(term) || 
          board.board_summary.toLowerCase().includes(term) ||
          board.tags.some(tag => tag.toLowerCase().includes(term))
        );
      }
      
      if (industries.length > 0) {
        filtered = filtered.filter(board => 
          board.industry.some(ind => industries.includes(ind))
        );
      }
      
      if (experienceLevels.length > 0) {
        filtered = filtered.filter(board => 
          board.experience_level.some(level => experienceLevels.includes(level))
        );
      }
      
      if (remoteOnly) {
        filtered = filtered.filter(board => board.remote_friendly);
      }
      
      setTimeout(() => resolve(filtered), 300);
    });
  },
  
  getJobBoardById: async (id: string): Promise<JobBoard | null> => {
    return new Promise((resolve) => {
      const board = mockJobBoards.find(board => board.id === id) || null;
      setTimeout(() => resolve(board), 200);
    });
  }
};

export default mockSupabaseClient;
