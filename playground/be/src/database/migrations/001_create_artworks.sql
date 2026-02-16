-- Artworks table for collaborative drawing platform
CREATE TABLE artworks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    author_name VARCHAR(100) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    canvas_data JSONB, -- Canvas 상태를 JSON으로 저장
    width INTEGER DEFAULT 800,
    height INTEGER DEFAULT 600,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    parent_artwork_id INTEGER REFERENCES artworks(id),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_artworks_created_at ON artworks(created_at DESC);
CREATE INDEX idx_artworks_likes ON artworks(likes DESC);
CREATE INDEX idx_artworks_views ON artworks(views DESC);
CREATE INDEX idx_artworks_author ON artworks(author_name);
CREATE INDEX idx_artworks_parent ON artworks(parent_artwork_id);
CREATE INDEX idx_artworks_public ON artworks(is_public);

-- Likes tracking table
CREATE TABLE artwork_likes (
    id SERIAL PRIMARY KEY,
    artwork_id INTEGER NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    user_ip VARCHAR(45), -- IP 기반 중복 방지 (익명 사용자)
    user_session VARCHAR(255), -- 세션 ID 기반 중복 방지
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(artwork_id, user_ip),
    UNIQUE(artwork_id, user_session)
);

-- History tracking table
CREATE TABLE artwork_history (
    id SERIAL PRIMARY KEY,
    artwork_id INTEGER NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'created', 'modified', 'forked'
    description TEXT,
    canvas_data_snapshot JSONB, -- Optional: store canvas state at this point
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_artworks_updated_at 
    BEFORE UPDATE ON artworks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO artworks (title, description, author_name, image_url, canvas_data, width, height) VALUES 
('Sample Drawing', 'A test drawing', 'TestUser', '/uploads/artworks/sample.png', '{"test": "data"}', 800, 600);