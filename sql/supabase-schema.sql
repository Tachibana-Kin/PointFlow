-- =====================================================
-- PointFlow 数据库 Schema
-- 在 Supabase SQL Editor 中运行
-- =====================================================

-- 1. users
CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  avatar     TEXT,
  role       TEXT NOT NULL CHECK (role IN ('super_admin', 'manager', 'member')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. pairs
CREATE TABLE pairs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id    UUID NOT NULL REFERENCES users(id),
  member_id     UUID UNIQUE NOT NULL REFERENCES users(id),
  name          TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 3. categories
CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  icon       TEXT,
  color      TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. rules
CREATE TABLE rules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id     UUID NOT NULL REFERENCES pairs(id),
  category_id UUID NOT NULL REFERENCES categories(id),
  title       TEXT NOT NULL,
  score       INT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('add', 'deduct')),
  punishment  JSONB,
  enabled     BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 5. records
CREATE TABLE records (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id      UUID NOT NULL REFERENCES pairs(id),
  user_id      UUID NOT NULL REFERENCES users(id),
  rule_id      UUID NOT NULL REFERENCES rules(id),
  score        INT NOT NULL,
  punishment   JSONB,
  remark       TEXT,
  image_urls   TEXT[],
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reviewer_id  UUID REFERENCES users(id),
  reviewed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- 6. punishment_logs
CREATE TABLE punishment_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id    UUID NOT NULL REFERENCES records(id),
  type         TEXT NOT NULL,
  amount       INT NOT NULL,
  executed     BOOLEAN DEFAULT false,
  executed_at  TIMESTAMPTZ,
  remark       TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- 7. streaks
CREATE TABLE streaks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  pair_id         UUID NOT NULL REFERENCES pairs(id),
  current_streak  INT DEFAULT 0,
  max_streak      INT DEFAULT 0,
  last_qualified  DATE,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 8. rewards
CREATE TABLE rewards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id     UUID NOT NULL REFERENCES pairs(id),
  title       TEXT NOT NULL,
  cost        INT NOT NULL,
  description TEXT,
  enabled     BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 9. reward_requests
CREATE TABLE reward_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id    UUID NOT NULL REFERENCES rewards(id),
  user_id      UUID NOT NULL REFERENCES users(id),
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reviewer_id  UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT now(),
  reviewed_at  TIMESTAMPTZ
);

-- 10. notifications
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id),
  title      TEXT NOT NULL,
  content    TEXT,
  read       BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_pairs_manager_id ON pairs(manager_id);
CREATE INDEX idx_rules_pair_category ON rules(pair_id, category_id);
CREATE INDEX idx_rules_enabled ON rules(enabled);
CREATE INDEX idx_records_pair_user ON records(pair_id, user_id);
CREATE INDEX idx_records_status ON records(status);
CREATE INDEX idx_records_created ON records(created_at);
CREATE INDEX idx_punishment_logs_record ON punishment_logs(record_id);
CREATE INDEX idx_punishment_logs_executed ON punishment_logs(executed);
CREATE INDEX idx_streaks_user ON streaks(user_id);
CREATE INDEX idx_reward_requests_user ON reward_requests(user_id, status);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);

-- Insert default categories
INSERT INTO categories (name, icon, color) VALUES
  ('日常学习', '📚', '#3b82f6'),
  ('考试成绩', '📝', '#8b5cf6'),
  ('个人拓展', '🌟', '#f59e0b'),
  ('家务', '🏠', '#10b981'),
  ('身体健康', '💪', '#ef4444'),
  ('违规行为', '⚠️', '#ef4444');
