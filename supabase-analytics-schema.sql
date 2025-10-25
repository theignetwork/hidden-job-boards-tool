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
    search_query TEXT,
    search_count BIGINT,
    avg_results INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        event_data->>'search_query' as search_query,
        COUNT(*) as search_count,
        AVG((event_data->>'results_count')::INT)::INT as avg_results
    FROM user_activity_events
    WHERE
        event_type = 'search_performed'
        AND timestamp > NOW() - time_window
        AND event_data->>'search_query' IS NOT NULL
        AND event_data->>'search_query' != ''
    GROUP BY event_data->>'search_query'
    ORDER BY search_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get user preferences (for RAG recommendations)
CREATE OR REPLACE FUNCTION get_user_preferences(
    p_user_id TEXT,
    time_window INTERVAL DEFAULT '30 days'
)
RETURNS TABLE (
    preferred_industries TEXT[],
    preferred_experience_levels TEXT[],
    prefers_remote BOOLEAN,
    favorite_board_ids TEXT[],
    viewed_board_ids TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        -- Aggregate industries from viewed boards
        ARRAY_AGG(DISTINCT industry) FILTER (WHERE industry IS NOT NULL) as preferred_industries,
        -- Aggregate experience levels from viewed boards
        ARRAY_AGG(DISTINCT exp_level) FILTER (WHERE exp_level IS NOT NULL) as preferred_experience_levels,
        -- Check if user views remote boards more often
        (COUNT(*) FILTER (WHERE (event_data->>'remote_friendly')::BOOLEAN = true) >
         COUNT(*) FILTER (WHERE (event_data->>'remote_friendly')::BOOLEAN = false)) as prefers_remote,
        -- List of favorited board IDs
        ARRAY_AGG(DISTINCT event_data->>'board_id') FILTER (WHERE event_type = 'board_favorited') as favorite_board_ids,
        -- List of viewed board IDs
        ARRAY_AGG(DISTINCT event_data->>'board_id') FILTER (WHERE event_type = 'board_viewed') as viewed_board_ids
    FROM user_activity_events
    CROSS JOIN LATERAL jsonb_array_elements_text(event_data->'industry') AS industry
    CROSS JOIN LATERAL jsonb_array_elements_text(event_data->'experience_level') AS exp_level
    WHERE
        user_id = p_user_id
        AND timestamp > NOW() - time_window
        AND event_type IN ('board_viewed', 'board_favorited');
END;
$$ LANGUAGE plpgsql;

-- Create a function to get popular filter combinations
CREATE OR REPLACE FUNCTION get_popular_filter_combinations(
    limit_count INT DEFAULT 10,
    time_window INTERVAL DEFAULT '7 days'
)
RETURNS TABLE (
    industries TEXT[],
    experience_levels TEXT[],
    remote_only BOOLEAN,
    usage_count BIGINT,
    avg_results INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ARRAY(SELECT jsonb_array_elements_text(event_data->'filters_applied'->'industry')) as industries,
        ARRAY(SELECT jsonb_array_elements_text(event_data->'filters_applied'->'experience')) as experience_levels,
        (event_data->'filters_applied'->>'remote')::BOOLEAN as remote_only,
        COUNT(*) as usage_count,
        AVG((event_data->>'results_count')::INT)::INT as avg_results
    FROM user_activity_events
    WHERE
        event_type = 'search_performed'
        AND timestamp > NOW() - time_window
        AND event_data->'filters_applied' IS NOT NULL
    GROUP BY
        event_data->'filters_applied'->'industry',
        event_data->'filters_applied'->'experience',
        event_data->'filters_applied'->>'remote'
    ORDER BY usage_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE user_activity_events IS 'Tracks essential user interactions for analytics and RAG integration (simplified to 4 event types)';
COMMENT ON COLUMN user_activity_events.event_type IS 'Type of event: board_viewed, board_favorited, board_unfavorited, search_performed';
COMMENT ON COLUMN user_activity_events.event_data IS 'JSON data containing event-specific information (board details, search query, filters, etc.) - no browser context';
COMMENT ON COLUMN user_activity_events.timestamp IS 'When the event occurred';

-- Grant necessary permissions (adjust based on your RLS policies)
ALTER TABLE user_activity_events ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (events are anonymous or user-identified)
CREATE POLICY "Anyone can insert events" ON user_activity_events
    FOR INSERT WITH CHECK (true);

-- Allow users to read their own events
CREATE POLICY "Users can read their own events" ON user_activity_events
    FOR SELECT USING (auth.uid()::TEXT = user_id OR user_id IS NULL);
