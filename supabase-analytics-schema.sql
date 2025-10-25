-- Create user_activity_events table for analytics tracking
-- This table stores all user interactions for analysis and future RAG integration

CREATE TABLE IF NOT EXISTS user_activity_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL,
    user_id TEXT,
    event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_activity_events_event_type
ON user_activity_events(event_type);

CREATE INDEX IF NOT EXISTS idx_user_activity_events_user_id
ON user_activity_events(user_id);

CREATE INDEX IF NOT EXISTS idx_user_activity_events_timestamp
ON user_activity_events(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_user_activity_events_board_id
ON user_activity_events((event_data->>'board_id'));

-- Add a GIN index for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_user_activity_events_event_data
ON user_activity_events USING GIN (event_data);

-- Create a view for common analytics queries
CREATE OR REPLACE VIEW analytics_summary AS
SELECT
    event_type,
    DATE_TRUNC('hour', timestamp) as hour,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users
FROM user_activity_events
GROUP BY event_type, DATE_TRUNC('hour', timestamp)
ORDER BY hour DESC;

-- Create a function to get popular boards
CREATE OR REPLACE FUNCTION get_popular_boards(
    limit_count INT DEFAULT 10,
    time_window INTERVAL DEFAULT '7 days'
)
RETURNS TABLE (
    board_id TEXT,
    board_name TEXT,
    view_count BIGINT,
    favorite_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        event_data->>'board_id' as board_id,
        event_data->>'board_name' as board_name,
        COUNT(*) FILTER (WHERE event_type = 'board_viewed') as view_count,
        COUNT(*) FILTER (WHERE event_type = 'board_favorited') as favorite_count
    FROM user_activity_events
    WHERE
        timestamp > NOW() - time_window
        AND event_data->>'board_id' IS NOT NULL
    GROUP BY event_data->>'board_id', event_data->>'board_name'
    ORDER BY view_count DESC, favorite_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get user search patterns
CREATE OR REPLACE FUNCTION get_popular_searches(
    limit_count INT DEFAULT 20,
    time_window INTERVAL DEFAULT '7 days'
)
RETURNS TABLE (
    search_term TEXT,
    search_count BIGINT,
    avg_results INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        event_data->>'search_term' as search_term,
        COUNT(*) as search_count,
        AVG((event_data->>'results_count')::INT)::INT as avg_results
    FROM user_activity_events
    WHERE
        event_type = 'search_performed'
        AND timestamp > NOW() - time_window
        AND event_data->>'search_term' IS NOT NULL
        AND event_data->>'search_term' != ''
    GROUP BY event_data->>'search_term'
    ORDER BY search_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE user_activity_events IS 'Tracks all user interactions for analytics and RAG integration';
COMMENT ON COLUMN user_activity_events.event_type IS 'Type of event: board_viewed, board_favorited, search_performed, filter_applied, etc.';
COMMENT ON COLUMN user_activity_events.event_data IS 'JSON data containing event-specific information (board details, search terms, filters, etc.)';
COMMENT ON COLUMN user_activity_events.timestamp IS 'When the event occurred';

-- Grant necessary permissions (adjust based on your RLS policies)
ALTER TABLE user_activity_events ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (events are anonymous or user-identified)
CREATE POLICY "Anyone can insert events" ON user_activity_events
    FOR INSERT WITH CHECK (true);

-- Allow users to read their own events
CREATE POLICY "Users can read their own events" ON user_activity_events
    FOR SELECT USING (auth.uid()::TEXT = user_id OR user_id IS NULL);
