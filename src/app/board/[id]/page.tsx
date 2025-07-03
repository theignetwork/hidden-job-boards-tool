import { getJobBoardById, getJobBoards } from '@/lib/supabase';
import BoardDetailClient from './BoardDetailClient';
import type { JobBoard } from '@/lib/supabase';

// This function tells Next.js which dynamic routes to pre-generate
export async function generateStaticParams() {
  try {
    const boards = await getJobBoards();
    return boards.map((board) => ({
      id: board.id,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

interface BoardDetailPageProps {
  params: {
    id: string;
  };
}

export default async function BoardDetailPage({ params }: BoardDetailPageProps) {
  const boardId = params.id;
  
  try {
    const board = await getJobBoardById(boardId);
    
    if (!board) {
      return (
        <div className="min-h-screen bg-gray-950 text-white">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <p className="text-red-500 text-lg mb-4">Board not found</p>
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

    return <BoardDetailClient board={board} />;
  } catch (error) {
    console.error('Error fetching board:', error);
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-red-500 text-lg mb-4">Failed to load board details</p>
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
}