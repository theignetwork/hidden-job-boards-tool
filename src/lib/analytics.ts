import { createClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } from './env';

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);

/**
 * Event types for analytics tracking (simplified for RAG integration)
 */
export type AnalyticsEventType =
  | 'board_viewed'
  | 'board_favorited'
  | 'board_unfavorited'
  | 'search_performed';

/**
 * Analytics event data structure
 */
export interface AnalyticsEvent {
  event_type: AnalyticsEventType;
  user_id?: string;
  event_data: Record<string, any>;
  timestamp?: string;
}

/**
 * Track an analytics event to Supabase
 * @param eventType - Type of event being tracked
 * @param eventData - Essential context about the event
 * @param userId - Optional user ID
 */
export async function trackEvent(
  eventType: AnalyticsEventType,
  eventData: Record<string, any> = {},
  userId?: string
): Promise<void> {
  try {
    const { error } = await supabase.from('user_activity_events').insert({
      event_type: eventType,
      user_id: userId || null,
      event_data: eventData,
      timestamp: new Date().toISOString()
    });

    if (error) {
      console.error('Analytics tracking error:', error);
    }
  } catch (error) {
    // Fail silently - analytics should never break the app
    console.error('Failed to track event:', error);
  }
}

/**
 * Track board view event
 */
export function trackBoardView(
  boardId: string,
  boardName: string,
  industry: string[],
  experienceLevel: string[],
  remoteFriendly: boolean,
  userId?: string
) {
  trackEvent('board_viewed', {
    board_id: boardId,
    board_name: boardName,
    industry,
    experience_level: experienceLevel,
    remote_friendly: remoteFriendly
  }, userId);
}

/**
 * Track favorite toggle event
 */
export function trackFavoriteToggle(
  boardId: string,
  boardName: string,
  isFavorite: boolean,
  userId?: string
) {
  trackEvent(
    isFavorite ? 'board_favorited' : 'board_unfavorited',
    {
      board_id: boardId,
      board_name: boardName
    },
    userId
  );
}

/**
 * Track search performed (includes filters applied)
 */
export function trackSearch(
  searchQuery: string,
  filtersApplied: {
    industries: string[];
    experienceLevels: string[];
    remoteOnly: boolean;
  },
  resultsCount: number,
  userId?: string
) {
  trackEvent('search_performed', {
    search_query: searchQuery,
    filters_applied: {
      industry: filtersApplied.industries,
      experience: filtersApplied.experienceLevels,
      remote: filtersApplied.remoteOnly
    },
    results_count: resultsCount
  }, userId);
}
