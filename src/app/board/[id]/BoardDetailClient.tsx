"use client";

import React from 'react';
import { useFavorites } from '@/hooks/useFavorites';
import Header from '@/components/Header';
import BoardDetail from '@/components/BoardDetail';
import Footer from '@/components/Footer';
import type { JobBoard } from '@/lib/supabase';

interface BoardDetailClientProps {
  board: JobBoard;
}

export default function BoardDetailClient({ board }: BoardDetailClientProps) {
  // For now, use hardcoded userId - we'll fix this later for WordPress integration
  const userId = 'test-user-id';
  const { favorites, toggleFavorite, isFavorite } = useFavorites(userId);

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