-- =====================================================
-- PointFlow 完整数据库设置
-- 在 Supabase SQL Editor 中运行（一次性执行）
-- =====================================================

-- 1. 启用 pgcrypto（密码哈希）
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. 建表
CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT,
  name       TEXT NOT NULL,
  avatar     TEXT,
  role       TEXT NOT NULL CHECK (role IN ('super_admin', 'manager', 'member')),
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

CREATE TABLE IF NOT EXISTS pairs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id    UUID NOT NULL REFERENCES users(id),
  member_id     UUID UNIQUE NOT NULL REFERENCES users(id),
  name          TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  icon       TEXT,
  color      TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rules (
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

CREATE TABLE IF NOT EXISTS records (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id      UUID REFERENCES pairs(id),
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

CREATE TABLE IF NOT EXISTS punishment_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id    UUID NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  type         TEXT NOT NULL,
  amount       INT NOT NULL,
  executed     BOOLEAN DEFAULT false,
  executed_at  TIMESTAMPTZ,
  remark       TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS streaks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  pair_id         UUID REFERENCES pairs(id),
  current_streak  INT DEFAULT 0,
  max_streak      INT DEFAULT 0,
  last_qualified  DATE,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rewards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id     UUID NOT NULL REFERENCES pairs(id),
  title       TEXT NOT NULL,
  cost        INT NOT NULL,
  description TEXT,
  enabled     BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reward_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id    UUID NOT NULL REFERENCES rewards(id),
  user_id      UUID NOT NULL REFERENCES users(id),
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reviewer_id  UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT now(),
  reviewed_at  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id),
  title      TEXT NOT NULL,
  content    TEXT,
  read       BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 登录函数
CREATE OR REPLACE FUNCTION login_user(p_name TEXT, p_password TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user users%ROWTYPE;
BEGIN
  SELECT * INTO v_user FROM users WHERE name = p_name;
  IF NOT FOUND THEN
    RAISE EXCEPTION '用户不存在';
  END IF;
  IF v_user.password_hash IS NULL OR v_user.password_hash = '' THEN
    RAISE EXCEPTION '用户未设置密码';
  END IF;
  IF v_user.password_hash != crypt(p_password, v_user.password_hash) THEN
    RAISE EXCEPTION '密码错误';
  END IF;
  RETURN json_build_object(
    'id', v_user.id,
    'name', v_user.name,
    'email', v_user.email,
    'role', v_user.role,
    'avatar', v_user.avatar
  );
END;
$$;

GRANT EXECUTE ON FUNCTION login_user TO anon;
GRANT EXECUTE ON FUNCTION login_user TO public;

-- 4. 禁用 RLS（使用应用层自定义登录）
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE pairs DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE records DISABLE ROW LEVEL SECURITY;
ALTER TABLE punishment_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE streaks DISABLE ROW LEVEL SECURITY;
ALTER TABLE rewards DISABLE ROW LEVEL SECURITY;
ALTER TABLE reward_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- 5. 默认分类
INSERT INTO categories (name, icon, color) VALUES
  ('日常学习', '📚', '#3b82f6'),
  ('考试成绩', '📝', '#8b5cf6'),
  ('个人拓展', '🌟', '#f59e0b'),
  ('家务', '🏠', '#10b981'),
  ('身体健康', '💪', '#ef4444'),
  ('违规行为', '⚠️', '#ef4444')
ON CONFLICT (name) DO NOTHING;

-- 6. 测试用户（密码通过 pgcrypt 加密）
INSERT INTO users (name, email, role, avatar, password_hash) VALUES
  ('管理员', 'admin@pointflow.local', 'super_admin', 'https://ui-avatars.com/api/?name=管理员&background=ef4444&color=fff&size=40', crypt('admin123', gen_salt('bf'))),
  ('监督者', 'manager@pointflow.local', 'manager', 'https://ui-avatars.com/api/?name=监督者&background=f59e0b&color=fff&size=40', crypt('manager123', gen_salt('bf'))),
  ('受管理者', 'member@pointflow.local', 'member', 'https://ui-avatars.com/api/?name=受管理&background=6366f1&color=fff&size=40', crypt('member123', gen_salt('bf')))
ON CONFLICT DO NOTHING;

-- 7. 创建配对
INSERT INTO pairs (manager_id, member_id, name)
SELECT
  (SELECT id FROM users WHERE name = '监督者'),
  (SELECT id FROM users WHERE name = '受管理者'),
  '监督者 → 受管理者'
WHERE NOT EXISTS (SELECT 1 FROM pairs WHERE name = '监督者 → 受管理者');

-- 新增成员和配对
INSERT INTO users (name, email, role, avatar, password_hash) VALUES
  ('调皮鬼', 'member2@pf.local', 'member', 'https://ui-avatars.com/api/?name=调皮鬼&background=6366f1&color=fff&size=40', crypt('member456', gen_salt('bf'))),
  ('小可爱', 'member3@pf.local', 'member', 'https://ui-avatars.com/api/?name=小可爱&background=6366f1&color=fff&size=40', crypt('member789', gen_salt('bf')))
ON CONFLICT DO NOTHING;

INSERT INTO pairs (manager_id, member_id, name)
SELECT
  (SELECT id FROM users WHERE name = '监督者'),
  (SELECT id FROM users WHERE name = '调皮鬼'),
  '监督者 → 调皮鬼'
WHERE NOT EXISTS (SELECT 1 FROM pairs WHERE name = '监督者 → 调皮鬼');

INSERT INTO pairs (manager_id, member_id, name)
SELECT
  (SELECT id FROM users WHERE name = '监督者'),
  (SELECT id FROM users WHERE name = '小可爱'),
  '监督者 → 小可爱'
WHERE NOT EXISTS (SELECT 1 FROM pairs WHERE name = '监督者 → 小可爱');

-- 8. 测试规则
INSERT INTO rules (pair_id, category_id, title, score, type, punishment)
SELECT
  (SELECT id FROM pairs WHERE name = '监督者 → 受管理者'),
  (SELECT id FROM categories WHERE name = cname),
  title, score, type, punishment
FROM (VALUES
  ('日常学习', '每学习1小时', 5, 'add'::TEXT, NULL::JSONB),
  ('日常学习', '按时起床（6:40前）', 3, 'add', NULL),
  ('日常学习', '按时睡觉（12:00前）', 3, 'add', NULL),
  ('考试成绩', '小考90分以上', 20, 'add', NULL),
  ('考试成绩', '小考80分以上', 10, 'add', NULL),
  ('家务', '做饭', 1, 'add', NULL),
  ('家务', '洗碗', 2, 'add', NULL),
  ('家务', '大扫除', 5, 'add', NULL),
  ('身体健康', '运动30分钟', 2, 'add', NULL),
  ('违规行为', '翘课', -10, 'deduct', '{"spanking":100}'::JSONB),
  ('违规行为', '学习时玩手机', -5, 'deduct', '{"standing":10}'::JSONB),
  ('违规行为', '小考低于60分', -10, 'deduct', '{"spanking":150,"standing":20}'::JSONB)
) AS t(cname, title, score, type, punishment)
WHERE NOT EXISTS (SELECT 1 FROM rules WHERE title = t.title);

-- 9. 测试奖励
INSERT INTO rewards (pair_id, title, cost, description)
SELECT
  (SELECT id FROM pairs WHERE name = '监督者 → 受管理者'),
  title, cost, description
FROM (VALUES
  ('按摩', 100, '享受一次全身按摩'),
  ('自由时间30分钟', 5, '半小时完全自由时间'),
  ('游戏1小时', 15, '打游戏一小时'),
  ('减免Spanking 10下', 10, '减少10下Spanking惩罚')
) AS t(title, cost, description)
WHERE NOT EXISTS (SELECT 1 FROM rewards WHERE title = t.title);

-- 10. 为新配对复制规则和奖励
INSERT INTO rules (pair_id, category_id, title, score, type, punishment)
SELECT p.id, r.category_id, r.title, r.score, r.type, r.punishment
FROM pairs p, rules r
WHERE r.pair_id = (SELECT id FROM pairs WHERE name = '监督者 → 受管理者')
  AND p.name IN ('监督者 → 调皮鬼', '监督者 → 小可爱')
  AND NOT EXISTS (
    SELECT 1 FROM rules r2
    WHERE r2.pair_id = p.id AND r2.title = r.title
  );

INSERT INTO rewards (pair_id, title, cost, description)
SELECT p.id, r.title, r.cost, r.description
FROM pairs p, rewards r
WHERE r.pair_id = (SELECT id FROM pairs WHERE name = '监督者 → 受管理者')
  AND p.name IN ('监督者 → 调皮鬼', '监督者 → 小可爱')
  AND NOT EXISTS (
    SELECT 1 FROM rewards r2
    WHERE r2.pair_id = p.id AND r2.title = r.title
  );

-- 12. 为每个 member 创建一条经审核通过的 +5 记录 × 200 = 1000 分
INSERT INTO records (pair_id, user_id, rule_id, score, punishment, status, reviewer_id)
SELECT
  p.id, p.member_id, r.id, 5, NULL, 'approved',
  (SELECT id FROM users WHERE name = '监督者')
FROM pairs p
JOIN rules r ON r.pair_id = p.id AND r.title = '每学习1小时'
CROSS JOIN generate_series(1, 200)
ON CONFLICT DO NOTHING;

-- 13. 索引
CREATE INDEX IF NOT EXISTS idx_rules_pair_category ON rules(pair_id, category_id);
CREATE INDEX IF NOT EXISTS idx_records_user ON records(user_id);
CREATE INDEX IF NOT EXISTS idx_records_status ON records(status);
CREATE INDEX IF NOT EXISTS idx_records_created ON records(created_at);
CREATE INDEX IF NOT EXISTS idx_punishment_logs_record ON punishment_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_reward_requests_user ON reward_requests(user_id, status);

-- 14. 验证
SELECT '✅ 数据库设置完成' as status;
SELECT id, name, role,
  CASE WHEN password_hash IS NOT NULL THEN '✅ 密码已设置' ELSE '❌ 密码缺失' END as pwd
FROM users;
