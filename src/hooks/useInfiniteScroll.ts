import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number; // Distance from bottom in pixels to trigger load
}

/**
 * Hook for infinite scroll functionality
 * Automatically triggers onLoadMore when user scrolls near bottom of page
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 500
}: UseInfiniteScrollOptions) {
  const observer = useRef<IntersectionObserver | null>(null);

  // Callback ref for the sentinel element
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;

      // Disconnect previous observer
      if (observer.current) {
        observer.current.disconnect();
      }

      // Create new observer
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoading) {
            onLoadMore();
          }
        },
        {
          rootMargin: `${threshold}px`
        }
      );

      // Observe the sentinel node
      if (node) {
        observer.current.observe(node);
      }
    },
    [isLoading, hasMore, onLoadMore, threshold]
  );

  return { sentinelRef };
}
