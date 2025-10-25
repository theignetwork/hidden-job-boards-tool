import { createClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } from './env';

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);

/**
 * Event types for analytics tracking
 */
export type AnalyticsEventType =
  | 'board_viewed'
  | 'board_favorited'
  | 'board_unfavorited'
  | 'search_performed'
  | 'filter_applied'
  | 'filter_cleared'
  | 'page_loaded'
  | 'tab_changed';

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
 * @param eventData - Additional context about the event
 * @param userId - Optional user ID
 */
export async function trackEvent(
  eventType: AnalyticsEventType,
  eventData: Record<string, any> = {},
  userId?: string
): Promise<void> {
  try {
    // Add browser/session context
    const enrichedData = {
      ...eventData,
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : null,
      screen_width: typeof window !== 'undefined' ? window.screen.width : null,
      screen_height: typeof window !== 'undefined' ? window.screen.height : null,
      referrer: typeof document !== 'undefined' ? document.referrer : null,
      url: typeof window !== 'undefined' ? window.location.href : null
    };

    const { error } = await supabase.from('user_activity_events').insert({
      event_type: eventType,
      user_id: userId || null,
      event_data: enrichedData,
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
export function trackBoardView(boardId: string, boardName: string, userId?: string) {
  trackEvent('board_viewed', {
    board_id: boardId,
    board_name: boardName
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
 * Track search performed
 */
export function trackSearch(
  searchTerm: string,
  resultsCount: number,
  userId?: string
) {
  trackEvent('search_performed', {
    search_term: searchTerm,
    results_count: resultsCount
  }, userId);
}

/**
 * Track filter applied
 */
export function trackFilterApplied(
  filters: {
    industries?: string[];
    experienceLevels?: string[];
    remoteOnly?: boolean;
  },
  resultsCount: number,
  userId?: string
) {
  trackEvent('filter_applied', {
    industries: filters.industries || [],
    experience_levels: filters.experienceLevels || [],
    remote_only: filters.remoteOnly || false,
    results_count: resultsCount
  }, userId);
}

/**
 * Track filter cleared
 */
export function trackFilterCleared(userId?: string) {
  trackEvent('filter_cleared', {}, userId);
}

/**
 * Track page load
 */
export function trackPageLoad(userId?: string) {
  trackEvent('page_loaded', {
    load_time: typeof window !== 'undefined'
      ? window.performance.timing.loadEventEnd - window.performance.timing.navigationStart
      : null
  }, userId);
}

/**
 * Track tab change
 */
export function trackTabChange(tab: 'all' | 'saved', userId?: string) {
  trackEvent('tab_changed', {
    tab
  }, userId);
}
