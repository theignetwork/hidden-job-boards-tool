/**
 * Analytics tracking - DISABLED
 *
 * All analytics functions are no-ops to avoid Supabase 404 errors.
 * Enable by creating user_activity_events table in Supabase.
 */

export type AnalyticsEventType =
  | 'board_viewed'
  | 'board_favorited'
  | 'board_unfavorited'
  | 'search_performed';

export interface AnalyticsEvent {
  event_type: AnalyticsEventType;
  user_id?: string | null;
  event_data: Record<string, any>;
  timestamp?: string;
}

/**
 * Track an analytics event (DISABLED - no-op)
 */
export async function trackEvent(
  eventType: AnalyticsEventType,
  eventData: Record<string, any> = {},
  userId?: string | null
): Promise<void> {
  // Analytics disabled - no-op
  return;
}

/**
 * Track board view event (DISABLED - no-op)
 */
export function trackBoardView(
  boardId: string,
  boardName: string,
  industry: string[],
  experienceLevel: string[],
  remoteFriendly: boolean,
  userId?: string | null
) {
  // Analytics disabled - no-op
  return;
}

/**
 * Track favorite toggle event (DISABLED - no-op)
 */
export function trackFavoriteToggle(
  boardId: string,
  boardName: string,
  isFavorite: boolean,
  userId?: string | null
) {
  // Analytics disabled - no-op
  return;
}

/**
 * Track search performed (DISABLED - no-op)
 */
export function trackSearch(
  searchQuery: string,
  filtersApplied: {
    industries: string[];
    experienceLevels: string[];
    remoteOnly: boolean;
  },
  resultsCount: number,
  userId?: string | null
) {
  // Analytics disabled - no-op
  return;
}
