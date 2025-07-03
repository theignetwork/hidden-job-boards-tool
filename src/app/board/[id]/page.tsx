"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getJobBoardById } from '@/lib/supabase';
import { useFavorites } from '@/hooks/useFavorites';
import Header from '@/components/Header';
import BoardDetail from '@/components/BoardDetail';
import Footer from '@/components/Footer';
import type { JobBoard } from '@/lib/supabase';

export default function BoardDetailPage() {
  const params = useParams();
  const boardId = params.id as string;
  const [board, setBoard] = useState<JobBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // For now, use hardcoded userId - we'll fix this later for WordPress integration
  const userId = 'test-user-id';
  const { favorites, toggleFavorite, isFavorite } = useFavorites(userId);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        setLoading(true);
        const boardData = await getJobBoardById(boardId);
        setBoard(boardData);
        setError(null);
      } catch (err) {
        console.error('Error fetching board:', err);
        setError('Failed to load board details');
      } finally {
        setLoading(false);
      }
    };

    if (boardId) {
      fetchBoard();
    }
  }, [boardId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="container mx-auto px-4 py-8">
          <Header currentBoard="Loading..." />
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="container mx-auto px-4 py-8">
          <Header />
          <div className="text-center py-12">
            <p className="text-red-500 text-lg mb-4">
              {error || 'Board not found'}
            </p>
            <a 
              href="/"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors"
            >
              Back to All Boards
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <Header currentBoard={board.name} />
        
        <main className="max-w-6xl mx-auto">
          <BoardDetail
            id={board.id}
            name={board.name}
            summary={board.board_summary}
            link={board.link}
            usageTips={board.usage_tips}
            industries={board.industry}
            remoteFriendly={board.remote_friendly}
            nonprofit={board.board_type.includes('Nonprofit')}
            featured={board.featured}
            isFavorite={isFavorite(board.id)}
            onToggleFavorite={toggleFavorite}
          />
        </main>
        
        <Footer />
      </div>
    </div>
  );
}