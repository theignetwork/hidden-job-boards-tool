import { useState, useEffect } from 'react';
import { getUserFavorites, addFavorite, removeFavorite } from '@/lib/supabase';

export const useFavorites = (userId: string) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const userFavorites = await getUserFavorites(userId);
        setFavorites(userFavorites);
        setError(null);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Failed to load favorites');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [userId]);

  const toggleFavorite = async (boardId: string) => {
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
