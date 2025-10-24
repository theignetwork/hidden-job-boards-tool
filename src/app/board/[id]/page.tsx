import { getJobBoardById, getJobBoards } from '@/lib/supabase';
import BoardDetailClient from './BoardDetailClient';
import type { JobBoard } from '@/lib/supabase';

// This function tells Next.js which dynamic routes to pre-generate
export async function generateStaticParams() {
  console.log('🔍 Starting generateStaticParams...');

  try {
    const boards = await getJobBoards();

    console.log(`✅ Successfully fetched ${boards.length} boards from Supabase`);

    if (boards.length === 0) {
      console.error('⚠️ WARNING: No boards fetched from Supabase!');
      throw new Error('Build failed: No boards fetched from Supabase. Check environment variables.');
    }

    console.log(`📄 Generating ${boards.length} static board pages...`);

    const params = boards.map((board) => ({
      id: board.id,
    }));

    console.log(`✅ Generated params for ${params.length} board pages`);

    return params;
  } catch (error) {
    console.error('❌ Error in generateStaticParams:', error);
    throw error; // This will fail the build if something goes wrong
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