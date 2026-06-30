-- =====================================================
-- PointFlow 自定义登录（用户名+密码）
-- 在 Supabase SQL Editor 中运行
-- 需要先运行 supabase-schema.sql
-- =====================================================

-- 1. 启用 pgcrypto 扩展（用于密码哈希）
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. 添加 password_hash 字段到 users 表
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 3. 创建登录验证函数
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

-- 4. 允许 anon 角色执行登录函数
GRANT EXECUTE ON FUNCTION login_user TO anon;

-- 5. 设置测试用户密码
UPDATE users SET password_hash = crypt('admin123', gen_salt('bf')) WHERE name = '管理员';
UPDATE users SET password_hash = crypt('manager123', gen_salt('bf')) WHERE name = '监督者';
UPDATE users SET password_hash = crypt('member123', gen_salt('bf')) WHERE name = '受管理者';

-- 6. 验证密码设置成功
SELECT id, name, role,
  CASE WHEN password_hash IS NOT NULL THEN 'OK' ELSE 'MISSING' END as password_status
FROM users;
