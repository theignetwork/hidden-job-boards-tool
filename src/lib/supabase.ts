import { USE_MOCK_DATA, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } from './env';
import { createClient } from '@supabase/supabase-js';
import mockSupabaseClient, { mockJobBoards } from './mockData';

// Types for our database tables
export type JobBoard = {
  id: string;
  name: string;
  industry: string[];
  experience_level: string[];
  remote_friendly: boolean;
  board_type: string[];
  link: string;
  usage_tips: string;
  tags: string[];
  board_summary: string;
  created_at: string;
  featured: boolean;
};

export type UserFavorite = {
  user_id: string;
  board_id: string;
  created_at: string;
};

// Create a single supabase client for interacting with the database
const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const getJobBoards = async (): Promise<JobBoard[]> => {
  if (USE_MOCK_DATA) {
    return mockSupabaseClient.getJobBoards();
  }

  // Supabase has a max-rows limit (usually 1000), so we need to paginate
  // to get ALL boards
  const pageSize = 1000;
  let allBoards: JobBoard[] = [];
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('hidden_job_boards')
      .select('*')
      .eq('active', true)  // Only fetch active boards
      .range(from, to);

    if (error) {
      console.error(`Error fetching job boards (page ${page}):`, error);
      break;
    }

    if (data && data.length > 0) {
      allBoards = [...allBoards, ...data];

      // If we got fewer rows than pageSize, we've reached the end
      if (data.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }
    } else {
      hasMore = false;
    }
  }

  return allBoards;
};

export const getUserFavorites = async (userId: string): Promise<string[]> => {
  if (USE_MOCK_DATA) {
    return mockSupabaseClient.getUserFavorites(userId);
  }
  
  const { data, error } = await supabase
    .from('user_favorites')
    .select('board_id')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching user favorites:', error);
    return [];
  }
  
  return data?.map(favorite => favorite.board_id) || [];
};

export const addFavorite = async (userId: string, boardId: string): Promise<boolean> => {
  if (USE_MOCK_DATA) {
    return mockSupabaseClient.addFavorite(userId, boardId);
  }
  
  const { error } = await supabase
    .from('user_favorites')
    .insert([{ user_id: userId, board_id: boardId }]);
  
  if (error) {
    console.error('Error adding favorite:', error);
    return false;
  }
  
  return true;
};

export const removeFavorite = async (userId: string, boardId: string): Promise<boolean> => {
  if (USE_MOCK_DATA) {
    return mockSupabaseClient.removeFavorite(userId, boardId);
  }
  
  const { error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('board_id', boardId);
  
  if (error) {
    console.error('Error removing favorite:', error);
    return false;
  }
  
  return true;
};

export const searchJobBoards = async (
  searchTerm: string = '',
  industries: string[] = [],
  experienceLevels: string[] = [],
  remoteOnly: boolean = false
): Promise<JobBoard[]> => {
  if (USE_MOCK_DATA) {
    return mockSupabaseClient.searchJobBoards(searchTerm, industries, experienceLevels, remoteOnly);
  }
  
  let query = supabase
    .from('hidden_job_boards')
    .select('*');
  
  // Apply search term if provided
  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,board_summary.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`);
  }
  
  // Apply industry filter if provided
  if (industries.length > 0) {
    const industryConditions = industries.map(industry => `industry.cs.{${industry}}`).join(',');
    query = query.or(industryConditions);
  }
  
  // Apply experience level filter if provided
  if (experienceLevels.length > 0) {
    const levelConditions = experienceLevels.map(level => `experience_level.cs.{${level}}`).join(',');
    query = query.or(levelConditions);
  }
  
  // Apply remote only filter if enabled
  if (remoteOnly) {
    query = query.eq('remote_friendly', true);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error searching job boards:', error);
    return [];
  }
  
  return data || [];
};

export const getJobBoardById = async (id: string): Promise<JobBoard | null> => {
  if (USE_MOCK_DATA) {
    return mockSupabaseClient.getJobBoardById(id);
  }
  
  const { data, error } = await supabase
    .from('hidden_job_boards')
    .select('*')
    .eq('id', id)
    .eq('active', true)  // Only return active boards
    .single();
  
  if (error) {
    console.error('Error fetching job board by ID:', error);
    return null;
  }
  
  return data;
};

export default supabase;
