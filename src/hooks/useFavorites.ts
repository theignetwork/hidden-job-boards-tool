import { useState, useEffect } from 'react';
import { getUserFavorites, addFavorite, removeFavorite } from '@/lib/supabase';

export const useFavorites = (userId: string | null) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        
        // Only fetch if we have a valid user ID
        if (userId) {
          const userFavorites = await getUserFavorites(userId);
          setFavorites(userFavorites);
        } else {
          setFavorites([]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Failed to load favorites');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [userId]);

  const toggleFavorite = async (boardId: string) => {
    // Don't allow favoriting without a user ID
    if (!userId) {
      console.warn('Cannot toggle favorite without user ID');
      return;
    }
    
    try {
      const isFavorite = favorites.includes(boardId);
      
      if (isFavorite) {
        const success = await removeFavorite(userId, boardId);
        if (success) {
          setFavorites(favorites.filter(id => id !== boardId));
        }
      } else {
        const success = await addFavorite(userId, boardId);
        if (success) {
          setFavorites([...favorites, boardId]);
        }
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError('Failed to update favorite');
    }
  };

  const isFavorite = (boardId: string) => favorites.includes(boardId);

  return { favorites, loading, error, toggleFavorite, isFavorite };
};
