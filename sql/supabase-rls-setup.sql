-- PointFlow RLS 配置（自定义登录版本）
-- 使用自定义用户名+密码登录，RLS 依赖 auth.uid() 不可用
-- 改为 permissive 模式，身份验证由登录密码保证

-- 对公共表禁用 RLS（应用层处理认证）
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

-- 删除旧的 RLS 策略（如果存在）
DROP POLICY IF EXISTS "member_select_self" ON users;
DROP POLICY IF EXISTS "manager_select_related" ON users;
DROP POLICY IF EXISTS "super_admin_all" ON users;
DROP POLICY IF EXISTS "member_insert_self" ON records;
DROP POLICY IF EXISTS "member_select_self" ON records;
DROP POLICY IF EXISTS "manager_own_pair" ON records;
DROP POLICY IF EXISTS "manager_own_pair_rules" ON rules;
DROP POLICY IF EXISTS "member_select_enabled" ON rules;
DROP POLICY IF EXISTS "select_related" ON pairs;

-- 验证
SELECT table_name, row_level_security FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
