# PointFlow 产品需求文档（完整版）

> Version: v2.0

# 1. 项目简介

PointFlow 是一个面向监督场景的积分管理系统，用于替代 Excel，实现规则化积分、审核、奖励兑换、惩罚执行、统计分析。

## 使用场景

- 情侣监督
- 家庭积分
- 学习监督
- 自律养成

# 2. 产品目标

- 快速记录行为
- 审核后生效
- 所有积分可追溯
- 惩罚执行可跟踪
- 手机、电脑均可使用
- 支持 PWA

# 3. 用户角色

## 3.1 Super Admin

- 创建配对（指定 manager 和 member）
- 管理所有用户和角色
- 管理系统分类

## 3.2 Manager（监督者）

- 管理配对内的规则和奖励（增查删改、批量操作）
- 审核配对内 member 的记录
- 记录惩罚执行
- 查看统计

## 3.3 Member（受管理者）

- 提交行为记录
- 查看积分和历史
- 申请兑换奖励

## 3.4 权限矩阵

| 功能 | Super Admin | Manager | Member |
|------|:-----------:|:-------:|:------:|
| 配对管理 | ✔ | — | — |
| 用户管理 | ✔ | — | — |
| 分类管理 | ✔ | — | — |
| 规则管理 | ✔ | 仅自己配对 | — |
| 奖励管理 | ✔ | 仅自己配对 | — |
| 审核记录 | — | 仅自己配对 member | — |
| 提交记录 | — | — | ✔ |
| 兑换申请 | — | — | ✔ |
| 惩罚执行 | — | 仅自己配对 | — |

# 4. 配对关系

## 4.1 配对机制

- 一个 Manager 可监督多个 Member（1:N）
- 一个 Member 只能属于一个配对
- 配对建立后暂不支持解除
- 规则、记录、奖励均通过 `pair_id` 隔离

## 4.2 数据模型

pairs 表存储配对关系，`member_id` 设 UNIQUE 约束确保单一隶属。

# 5. 功能模块

## 5.1 登录

Magic Link 登录（Supabase Auth）。根据 `role` 跳转对应首页。

## 5.2 Dashboard

显示：

- 当前积分
- 今日 / 本周 / 本月积分
- 连续打卡天数
- 快捷按钮（新建记录、申请兑换）
- 待审核数量（Manager 可见）
- 待执行惩罚数（Manager 可见）

## 5.3 行为记录

字段：

- 用户（自动取当前 member）
- 配对（自动取当前 member 所属配对）
- 规则
- 分类
- 积分（根据规则自动计算）
- 惩罚（根据规则自动带入）
- 备注
- 图片（预留）
- 状态：Pending / Approved / Rejected

流程：

1. Member 选择规则，系统自动填入积分和惩罚
2. 提交后状态为 Pending
3. Manager 审核后生效/驳回

## 5.4 审核中心

Manager 可：

- 通过
- 驳回（填写驳回理由）
- 修改积分
- 批量审核

## 5.5 惩罚执行

- 一条记录可关联多次惩罚执行（分批）
- Manager 记录每次执行：类型、数量、执行时间
- 惩罚类型：spanking / standing / face_wall 等自定义
- 记录中显示已执行 / 未执行状态

## 5.6 豁免机制

- 连续 N 天无违规记录，触发额外加分
- 由系统自动检测和发放
- 通过 streaks 表记录连续状态

## 5.7 奖励商城

奖励字段：

- 名称
- 消耗积分
- 描述
- 是否启用

兑换流程：申请 → 审核 → 扣分。

## 5.8 历史记录

支持：

- 分类筛选
- 时间筛选
- 搜索
- 导出 Excel（后续）

## 5.9 数据统计

图表：

- 每日积分趋势
- 分类占比
- 月度统计
- 排行榜

## 5.10 通知

后续 Sprint 实现：

- Manager 审核后通知 Member
- 惩罚即将过期提醒

# 6. 管理后台

## 6.1 配对管理

Super Admin 页面 `/admin/pairs`

- 列表显示所有配对（manager 名称 → member 名称）
- 新建配对（选择 manager 用户、选择 member 用户）
- 删除配对（暂不支持，预留）

## 6.2 用户管理

Super Admin 页面 `/admin/users`

- 列表显示所有用户
- 修改用户角色
- 关联配对（快捷入口）

## 6.3 规则管理

Manager / Super Admin 页面 `/admin/rules`

- 布局：左侧分类树，右侧规则列表
- 点击分类，右侧显示该分类下的规则
- 每条规则显示：标题、积分值、惩罚（如有）、启用状态
- 新增 / 编辑 / 删除规则
- 批量操作：批量启用、批量禁用、批量删除
- Manager 仅操作自己配对内的规则

## 6.4 奖励管理

Manager 页面 `/admin/rewards`

- 列表显示配对内所有奖励
- 新增 / 编辑 / 删除
- 启用/禁用

## 6.5 分类管理

Super Admin 页面 `/admin/categories`

- 列表显示全局分类
- 新增 / 编辑 / 删除（名称、图标、颜色）

# 7. 数据库设计

命名风格：全英文 snake_case

## 7.1 users

```sql
CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  avatar     TEXT,
  role       TEXT NOT NULL CHECK (role IN ('super_admin', 'manager', 'member')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## 7.2 pairs

```sql
CREATE TABLE pairs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id    UUID NOT NULL REFERENCES users(id),
  member_id     UUID UNIQUE NOT NULL REFERENCES users(id),
  name          TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

## 7.3 categories

```sql
CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  icon       TEXT,
  color      TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## 7.4 rules

```sql
CREATE TABLE rules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id     UUID NOT NULL REFERENCES pairs(id),
  category_id UUID NOT NULL REFERENCES categories(id),
  title       TEXT NOT NULL,
  score       INT NOT NULL,                -- 正数加分，负数扣分
  type        TEXT NOT NULL CHECK (type IN ('add', 'deduct')),
  punishment  JSONB,                       -- 灵活结构，如 {"spanking":100,"standing":20}
  enabled     BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
```

## 7.5 records

```sql
CREATE TABLE records (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id      UUID NOT NULL REFERENCES pairs(id),
  user_id      UUID NOT NULL REFERENCES users(id),
  rule_id      UUID NOT NULL REFERENCES rules(id),
  score        INT NOT NULL,               -- 0 表示纯惩罚记录
  punishment   JSONB,                      -- 规则惩罚快照
  remark       TEXT,
  image_urls   TEXT[],                     -- 预留多图
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reviewer_id  UUID REFERENCES users(id),
  reviewed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now()
);
```

## 7.6 punishment_logs

```sql
CREATE TABLE punishment_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id    UUID NOT NULL REFERENCES records(id),
  type         TEXT NOT NULL,              -- 'spanking' / 'standing' / 'face_wall' 等
  amount       INT NOT NULL,              -- 数量（下/分钟）
  executed     BOOLEAN DEFAULT false,
  executed_at  TIMESTAMPTZ,
  remark       TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);
```

## 7.7 streaks

```sql
CREATE TABLE streaks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  pair_id         UUID NOT NULL REFERENCES pairs(id),
  current_streak  INT DEFAULT 0,
  max_streak      INT DEFAULT 0,
  last_qualified  DATE,
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

## 7.8 rewards

```sql
CREATE TABLE rewards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id     UUID NOT NULL REFERENCES pairs(id),
  title       TEXT NOT NULL,
  cost        INT NOT NULL,
  description TEXT,
  enabled     BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

## 7.9 reward_requests

```sql
CREATE TABLE reward_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id    UUID NOT NULL REFERENCES rewards(id),
  user_id      UUID NOT NULL REFERENCES users(id),
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reviewer_id  UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT now(),
  reviewed_at  TIMESTAMPTZ
);
```

## 7.10 notifications

```sql
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id),
  title      TEXT NOT NULL,
  content    TEXT,
  read       BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## 7.11 索引

| 表 | 索引字段 | 说明 |
|----|---------|------|
| pairs | manager_id | Manager 查询自己的配对 |
| pairs | member_id | UNIQUE — 防止 member 多属 |
| rules | pair_id, category_id | 规则列表按配对+分类筛选 |
| rules | enabled | 筛选启用/禁用的规则 |
| records | pair_id, user_id | 按配对+用户查记录 |
| records | status | 按状态筛选待审核 |
| records | created_at | 按时间排序和筛选 |
| punishment_logs | record_id | 查一条记录的惩罚执行 |
| punishment_logs | executed | 筛选未执行的惩罚 |
| streaks | user_id | 查用户连续状态 |
| reward_requests | user_id, status | 查用户的兑换申请 |
| notifications | user_id, read | 查用户未读通知 |

## 7.12 枚举汇总

| 字段 | 值 |
|------|----|
| users.role | `super_admin` / `manager` / `member` |
| rules.type | `add` / `deduct` |
| records.status | `pending` / `approved` / `rejected` / `cancelled` |
| reward_requests.status | `pending` / `approved` / `rejected` / `cancelled` |

# 8. 类型定义（TypeScript）

```typescript
// 用户
interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'super_admin' | 'manager' | 'member'
  created_at: string
}

// 配对
interface Pair {
  id: string
  manager_id: string
  member_id: string
  name?: string
  created_at: string
}

// 分类
interface Category {
  id: string
  name: string
  icon?: string
  color?: string
}

// 规则
interface Rule {
  id: string
  pair_id: string
  category_id: string
  title: string
  score: number
  type: 'add' | 'deduct'
  punishment?: Record<string, number>  // 如 { spanking: 100, standing: 20 }
  enabled: boolean
  created_at: string
  updated_at: string
}

// 行为记录
interface Record {
  id: string
  pair_id: string
  user_id: string
  rule_id: string
  score: number
  punishment?: Record<string, number>
  remark?: string
  image_urls?: string[]
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  reviewer_id?: string
  reviewed_at?: string
  created_at: string
}

// 惩罚执行日志
interface PunishmentLog {
  id: string
  record_id: string
  type: string
  amount: number
  executed: boolean
  executed_at?: string
  remark?: string
  created_at: string
}

// 连续打卡
interface Streak {
  id: string
  user_id: string
  pair_id: string
  current_streak: number
  max_streak: number
  last_qualified?: string
}

// 奖励
interface Reward {
  id: string
  pair_id: string
  title: string
  cost: number
  description?: string
  enabled: boolean
}

// 兑换申请
interface RewardRequest {
  id: string
  reward_id: string
  user_id: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  reviewer_id?: string
  created_at: string
  reviewed_at?: string
}

// 通知
interface Notification {
  id: string
  user_id: string
  title: string
  content?: string
  read: boolean
  created_at: string
}

// Dashboard 数据
interface DashboardData {
  current_score: number
  today_score: number
  week_score: number
  month_score: number
  streak: number
  pending_review: number
  pending_punishments: number
}
```

# 9. API 设计

基础路径：`/api/v1`

认证方式：Supabase JWT（Bearer token）

## 9.1 认证

| Method | Path | 说明 | 鉴权 |
|--------|------|------|------|
| POST | /auth/login | 发送 Magic Link | 无需 |
| GET | /auth/callback | Magic Link 回调 | 无需 |
| POST | /auth/logout | 登出 | ✔ |
| GET | /auth/me | 获取当前用户信息 | ✔ |

## 9.2 管理端

### 用户管理 (Super Admin)

| Method | Path | 说明 |
|--------|------|------|
| GET | /users | 用户列表 |
| POST | /users | 创建用户 |
| PUT | /users/:id | 更新角色等信息 |
| DELETE | /users/:id | 删除用户 |

### 配对管理 (Super Admin)

| Method | Path | 说明 |
|--------|------|------|
| GET | /pairs | 配对列表 |
| POST | /pairs | 创建配对 |
| DELETE | /pairs/:id | 删除配对（预留） |

### 分类管理 (Super Admin)

| Method | Path | 说明 |
|--------|------|------|
| GET | /categories | 分类列表 |
| POST | /categories | 新增分类 |
| PUT | /categories/:id | 更新分类 |
| DELETE | /categories/:id | 删除分类 |

### 规则管理 (Manager — 仅操作自己配对)

| Method | Path | 说明 |
|--------|------|------|
| GET | /rules | 规则列表（支持 ?category_id= 和 ?pair_id= 筛选） |
| POST | /rules | 新增规则 |
| PUT | /rules/:id | 更新规则 |
| DELETE | /rules/:id | 删除规则 |
| POST | /rules/batch | 批量操作（body: { ids, action: 'enable'/'disable'/'delete' }） |

### 奖励管理 (Manager — 仅操作自己配对)

| Method | Path | 说明 |
|--------|------|------|
| GET | /rewards | 奖励列表 |
| POST | /rewards | 新增奖励 |
| PUT | /rewards/:id | 更新奖励 |
| DELETE | /rewards/:id | 删除奖励 |

## 9.3 前台

### 记录 (Member / Manager)

| Method | Path | 说明 |
|--------|------|------|
| GET | /records | 记录列表（支持 status / category_id / date_from / date_to 筛选） |
| POST | /records | 新建记录（Member） |
| GET | /records/:id | 记录详情 |
| POST | /records/:id/review | 审核记录（Manager — body: { status, score?, remark? }） |

### 惩罚执行 (Manager)

| Method | Path | 说明 |
|--------|------|------|
| GET | /punishment-logs | 惩罚日志列表（支持 ?record_id= 筛选） |
| POST | /punishment-logs | 记录惩罚执行 |
| PUT | /punishment-logs/:id | 更新执行状态（标记已执行） |

### 奖励兑换 (Member / Manager)

| Method | Path | 说明 |
|--------|------|------|
| GET | /reward-requests | 兑换申请列表 |
| POST | /reward-requests | 提交兑换申请（Member） |
| PUT | /reward-requests/:id/review | 审核申请（Manager） |

## 9.4 数据

| Method | Path | 说明 |
|--------|------|------|
| GET | /dashboard | 获取 Dashboard 数据 |
| GET | /stats/daily-trend | 每日积分趋势 |
| GET | /stats/category-breakdown | 分类占比 |
| GET | /stats/monthly | 月度统计 |
| GET | /stats/leaderboard | 排行榜（配对内成员间） |

## 9.5 通用响应格式

```json
// 成功
{ "data": { ... } }

// 列表
{ "data": [...], "total": 100, "page": 1, "page_size": 20 }

// 错误
{ "error": { "code": "NOT_FOUND", "message": "记录不存在" } }
```

## 9.6 HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

# 10. 路由设计

## 10.1 路由表

| 路径 | 页面 | 角色 | 说明 |
|------|------|------|------|
| /login | 登录页 | 无需认证 | |
| /dashboard | 首页 | all | 登录后首页 |
| /records/new | 新建记录 | member | |
| /records | 历史记录 | all | 带筛选 |
| /records/:id | 记录详情 | all | |
| /review | 审核中心 | manager | |
| /rewards | 奖励商城 | all | |
| /rewards/requests | 兑换记录 | member | |
| /rewards/requests/:id | 兑换详情 | all | |
| /stats | 数据统计 | all | |
| /admin/users | 用户管理 | super_admin | |
| /admin/pairs | 配对管理 | super_admin | |
| /admin/categories | 分类管理 | super_admin | |
| /admin/rules | 规则管理 | super_admin, manager | 分类树+规则列表 |
| /admin/rewards | 奖励管理 | super_admin, manager | |
| /settings | 设置 | all | |

## 10.2 导航守卫

- 未认证 → 重定向到 `/login`
- member 访问 `/review`、`/admin/*` → 403
- manager 访问 `/admin/users`、`/admin/pairs`、`/admin/categories` → 403（仅 super_admin）
- super_admin 访问全部

# 11. 前端架构

## 11.1 目录结构

```
src/
├── api/           # API 封装（axios/fetch + 类型）
├── assets/        # 静态资源（图片、图标）
├── components/    # 公共组件
│   ├── common/    # 通用组件（Button、Card、Modal、Empty 等）
│   ├── layout/    # 布局组件（Sidebar、Header、MobileNav）
│   └── business/  # 业务组件（RecordCard、RuleTree、PunishmentItem 等）
├── composables/   # 组合式函数（useAuth、useRecords、usePunishment 等）
├── layouts/       # 布局模板（DefaultLayout、AdminLayout）
├── pages/         # 页面组件（按路由模块组织）
│   ├── login/
│   ├── dashboard/
│   ├── records/
│   ├── review/
│   ├── rewards/
│   ├── stats/
│   ├── admin/
│   │   ├── users/
│   │   ├── pairs/
│   │   ├── categories/
│   │   ├── rules/
│   │   └── rewards/
│   └── settings/
├── router/        # Vue Router 配置 + 守卫
├── stores/        # Pinia 状态管理
├── types/         # TypeScript 类型定义
└── utils/         # 工具函数
```

## 11.2 组件树

```
App.vue
├── DefaultLayout
│   ├── MobileNav (底部导航，移动端)
│   ├── Sidebar (侧边栏，桌面端)
│   └── RouterView
│       ├── DashboardPage
│       │   ├── ScoreCard
│       │   ├── StreakBadge
│       │   ├── QuickActions
│       │   └── PendingBadge (Manager 可见)
│       ├── RecordNewPage
│       │   ├── CategorySelector
│       │   ├── RuleSelector
│       │   ├── ScorePreview
│       │   └── PunishmentPreview (如有惩罚)
│       ├── RecordsListPage
│       │   ├── FilterBar (分类/时间/搜索)
│       │   └── RecordCard[]
│       ├── ReviewPage
│       │   ├── PendingList
│       │   └── ReviewModal
│       │       └── PunishmentSection
│       ├── RewardsPage
│       │   ├── RewardCard[]
│       │   └── RequestModal
│       └── StatsPage
│           ├── TrendChart
│           ├── PieChart
│           └── Leaderboard
└── AdminLayout
    ├── AdminSidebar
    └── RouterView
        ├── UsersPage
        ├── PairsPage
        ├── CategoriesPage
        ├── RulesPage
        │   ├── CategoryTree (左)
        │   └── RulesTable (右)
        └── RewardsManagePage
```

## 11.3 状态管理（Pinia Store）

| Store | 状态 | 说明 |
|-------|------|------|
| useAuthStore | user, session | 认证信息 |
| usePairStore | pairs, currentPair | 配对信息 |
| useCategoryStore | categories | 全局分类 |
| useRuleStore | rules, loading | 规则列表 |
| useRecordStore | records, pendingCount, filters | 行为记录 |
| usePunishmentStore | punishmentLogs | 惩罚执行记录 |
| useRewardStore | rewards, requests | 奖励 + 兑换申请 |
| useDashboardStore | dashboardData | Dashboard 聚合数据 |

# 12. UI 规范

## 12.1 设计令牌（CSS 变量）

```css
:root {
  /* 颜色 - 积分语义 */
  --color-score-positive: #22c55e;    /* 绿色 - 加分 */
  --color-score-negative: #ef4444;    /* 红色 - 扣分 */
  --color-score-pending:  #eab308;    /* 黄色 - 待审核 */

  /* 颜色 - 品牌 */
  --color-primary:   #3b82f6;
  --color-bg:        #0f172a;         /* 深色模式背景 */
  --color-bg-card:   #1e293b;
  --color-bg-hover:  #334155;
  --color-text:      #f1f5f9;
  --color-text-muted:#94a3b8;
  --color-border:    #334155;

  /* 间距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* 圆角 */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;

  /* 字体 */
  --font-size-sm: 13px;
  --font-size-md: 15px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;
}
```

## 12.2 布局规范

- 移动端优先
- 移动端：底部 Tab 导航
- 桌面端：左侧 Sidebar
- 卡片式布局，圆角 `--radius-md`
- 深色模式为默认

## 12.3 响应式断点

| 断点 | 宽度 | 布局 |
|------|------|------|
| sm | < 640px | 单列 + 底部导航 |
| md | 640-1024px | 双列 + 收起侧栏 |
| lg | > 1024px | 多列 + 侧栏展开 |

# 13. 权限设计（RLS）

## Supabase Row Level Security

### users 表

```sql
-- Member 只能查看自己
CREATE POLICY "member_select_self" ON users
  FOR SELECT USING (auth.uid() = id AND role = 'member');

-- Manager 查看自己和所属配对 member
CREATE POLICY "manager_select_related" ON users
  FOR SELECT USING (
    role IN ('manager', 'super_admin')
    OR id IN (
      SELECT member_id FROM pairs WHERE manager_id = auth.uid()
    )
  );

-- Super Admin 全权限
CREATE POLICY "super_admin_all" ON users
  FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');
```

### records 表

```sql
-- Member 只能 INSERT 自己
CREATE POLICY "member_insert_self" ON records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Member 只能 SELECT 自己
CREATE POLICY "member_select_self" ON records
  FOR SELECT USING (auth.uid() = user_id);

-- Manager 操作自己配对内的记录
CREATE POLICY "manager_own_pair" ON records
  FOR ALL USING (
    pair_id IN (SELECT id FROM pairs WHERE manager_id = auth.uid())
  );
```

### rules 表

```sql
-- Manager 管理自己配对的规则
CREATE POLICY "manager_own_pair_rules" ON rules
  FOR ALL USING (
    pair_id IN (SELECT id FROM pairs WHERE manager_id = auth.uid())
  );

-- Member 只能查看自己配对已启用的规则
CREATE POLICY "member_select_enabled" ON rules
  FOR SELECT USING (
    enabled = true AND pair_id IN (SELECT pair_id FROM pairs WHERE member_id = auth.uid())
  );
```

### pairs 表

```sql
-- Super Admin 全权限
-- Manager 可查看自己作为 manager 的配对
-- Member 可查看自己作为 member 的配对
CREATE POLICY "select_related" ON pairs
  FOR SELECT USING (
    manager_id = auth.uid() OR member_id = auth.uid() OR auth.jwt() ->> 'role' = 'super_admin'
  );
```

# 14. 非功能性需求

## 14.1 性能

- 页面首屏加载 < 3s
- 列表页分页，每页 20 条
- 图表数据预聚合，避免实时全表扫描

## 14.2 离线策略（PWA）

- 静态资源 Service Worker 缓存
- 核心页面可离线访问
- 记录提交失败时暂存本地，网络恢复后自动重试

## 14.3 无障碍

- 所有交互元素支持键盘操作
- 图标按钮附带 aria-label
- 色彩对比度 ≥ 4.5:1

## 14.4 安全

- 所有 API 需 JWT 认证
- Supabase RLS 行级权限
- 输入校验（前后端双重）
- 防止 SQL 注入（参数化查询）
- 敏感操作记录审计日志（records 天然可追溯）

# 15. Sprint 规划

| Sprint | 周期 | 内容 |
|--------|------|------|
| Sprint 1 | 第 1-2 周 | 项目初始化、登录、Dashboard、行为记录提交 |
| Sprint 2 | 第 3-4 周 | 审核中心、惩罚执行（含 punishment_logs）、豁免机制 |
| Sprint 3 | 第 5-6 周 | 管理后台（用户/配对/分类/规则/奖励管理，含批量操作） |
| Sprint 4 | 第 7-8 周 | 奖励商城（兑换流程）、历史记录、数据统计 |
| Sprint 5 | 第 9-10 周 | PWA 支持、通知、导出 Excel、响应式打磨 |

# 16. 测试策略

## 16.1 测试框架

- Vitest（单元测试）
- Vue Test Utils（组件测试）
- Playwright（E2E 测试）

## 16.2 测试目录

```
src/
└── __tests__/
    ├── unit/       # 单元测试
    │   ├── stores/
    │   ├── utils/
    │   └── composables/
    ├── components/ # 组件测试
    └── e2e/        # E2E 测试
        └── specs/
```

## 16.3 测试范围

| 模块 | 类型 | 覆盖内容 |
|------|------|---------|
| 认证 | E2E | 登录、登出、鉴权跳转 |
| 权限 | 单元 | RLS 策略逻辑、路由守卫 |
| 记录 | 单元+组件 | 提交、列表、筛选、审核 |
| 惩罚 | 单元 | 执行记录、分批、状态变更 |
| 兑换 | 单元+组件 | 申请、审核、积分扣减 |
| 统计 | 单元 | 数据聚合、图表数据 |
| 管理端 | E2E | 各 CRUD 流程、批量操作 |
| 响应式 | E2E | 移动端/桌面端布局 |

# 17. 部署

- 前端：Vercel
- 数据库：Supabase（PostgreSQL）
- 认证：Supabase Auth（Magic Link）
- 存储：Supabase Storage（图片预留）
- 域名：支持绑定自定义域名

# 18. OpenCode 开发要求

采用 TDD 思维。每完成一个模块：

1. 建立类型定义
2. 建立 API
3. 建立 Store
4. 建立页面
5. 建立组件
6. 编写测试
7. 自检并提交

禁止硬编码积分规则，全部来自数据库。
