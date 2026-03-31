-- 0014_ai_features.sql
-- AI 功能相关字段

ALTER TABLE files ADD COLUMN ai_summary TEXT;
ALTER TABLE files ADD COLUMN ai_summary_at TEXT;
ALTER TABLE files ADD COLUMN ai_tags TEXT;
ALTER TABLE files ADD COLUMN ai_tags_at TEXT;
ALTER TABLE files ADD COLUMN vector_indexed_at TEXT;
ALTER TABLE files ADD COLUMN is_starred INTEGER DEFAULT 0;

CREATE INDEX idx_files_vector_indexed ON files(userId, vector_indexed_at);
CREATE INDEX idx_files_ai_summary ON files(userId, ai_summary_at);
CREATE INDEX idx_files_ai_tags ON files(userId, ai_tags_at);
CREATE INDEX idx_files_is_starred ON files(userId, is_starred, updatedAt DESC);
