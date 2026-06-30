# PointFlow

面向双人监督场景的积分管理系统 — 规则化积分、审核、奖励兑换、惩罚执行、统计分析。

## 使用场景

- 情侣监督
- 家庭积分
- 学习监督
- 自律养成

## 功能特性

- **Magic Link 登录** — Supabase Auth，无密码
- **行为记录** — 选择规则，自动计算积分和惩罚，提交待审
- **审核中心** — 通过/驳回/批量审核，支持修改积分
- **惩罚执行** — 关联记录，分批执行，跟踪状态
- **豁免机制** — 连续 N 天无违规自动加分
- **奖励商城** — 积分兑换，审核后扣分
- **管理后台** — 用户/配对/分类/规则/奖励 CRUD，批量操作
- **数据统计** — 积分趋势、分类占比、月度统计、排行榜
- **深色主题** — 移动端优先，PWA 支持

## 角色体系

| 角色 | 权限 |
|------|------|
| Super Admin | 系统管理员 — 创建配对、管理用户/分类 |
| Manager | 监督者 — 管理配对内规则/奖励、审核记录、执行惩罚 |
| Member | 受管理者 — 提交记录、查看积分、申请兑换 |

配对关系为 1:N（一个 Manager 可监督多个 Member），所有数据通过 `pair_id` 隔离。

## 技术栈

| 层 | 技术 |
|---|------|
| 框架 | Vue 3 + TypeScript |
| 构建 | Vite |
| 路由 | Vue Router 4 |
| 状态 | Pinia |
| 后端 | Supabase (PostgreSQL + Auth + RLS) |
| 部署 | Vercel |
| 测试 | Vitest + Vue Test Utils + Playwright |

## 快速开始

### 前置要求

- Node.js >= 18
- Supabase 项目（免费 tier 即可）

### 安装

```bash
# 克隆项目
git clone <repo-url> pointflow
cd pointflow

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 配置 Supabase

1. 在 [supabase.com](https://supabase.com) 创建项目
2. 复制 `.env` 文件并填入你的 Supabase URL 和 Anon Key：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_APP_NAME=PointFlow
```

3. 在 Supabase SQL Editor 中运行数据库 Schema（见 `docs/schema.sql`）

### 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run test` | 运行测试（UI 模式） |
| `npm run test:run` | 运行测试（CLI 模式） |

## 项目结构

```
src/
├── api/              # API 封装（fetch + Supabase）
├── components/       # 组件
│   ├── common/       # 通用组件（Button, Card, Modal...）
│   ├── layout/       # 布局组件（Sidebar, MobileNav...）
│   └── business/     # 业务组件（RecordCard, RulesTable...）
├── layouts/          # 布局模板
├── stores/           # Pinia 状态管理
├── types/            # TypeScript 类型定义
├── views/            # 页面组件
│   ├── admin/        # 管理后台页面
│   └── ...           # 前台页面
├── router/           # 路由配置 + 导航守卫
├── main.ts           # 应用入口
└── style.css         # 设计令牌 / 全局样式
```

## API 概览

基础路径：`/api/v1`，认证方式：Supabase JWT Bearer Token。

### 认证

| Method | Path | 说明 |
|--------|------|------|
| POST | `/auth/login` | 发送 Magic Link |
| POST | `/auth/logout` | 登出 |
| GET | `/auth/me` | 获取当前用户 |

### 管理端 (Super Admin / Manager)

| Method | Path | 说明 |
|--------|------|------|
| GET/POST | `/users`, `/pairs`, `/categories`, `/rules`, `/rewards` | CRUD |
| PUT/DELETE | `/:id` | 更新/删除 |
| POST | `/rules/batch` | 批量操作 |

### 前台 (Member / Manager)

| Method | Path | 说明 |
|--------|------|------|
| GET/POST | `/records` | 记录列表/新建 |
| POST | `/records/:id/review` | 审核记录 |
| GET/POST | `/punishment-logs` | 惩罚日志/记录执行 |
| GET/POST | `/reward-requests` | 兑换申请列表/提交 |
| PUT | `/reward-requests/:id/review` | 审核申请 |
| GET | `/dashboard` | Dashboard 数据 |
| GET | `/stats/*` | 统计数据 |

## 数据库

### 核心表

| 表 | 说明 |
|----|------|
| users | 用户（role: super_admin / manager / member） |
| pairs | 配对关系（manager → member, 1:N） |
| categories | 全局分类 |
| rules | 规则（关联分类 + 配对，含惩罚 JSON） |
| records | 行为记录（积分 + 惩罚快照） |
| punishment_logs | 惩罚分批执行记录 |
| streaks | 连续打卡状态 |
| rewards | 奖励（按配对隔离） |
| reward_requests | 兑换申请 |
| notifications | 通知 |

详见 [PRD 文档](./PointFlow_PRD_完整版.md#7-数据库设计)。

## Sprint 规划

| Sprint | 内容 |
|--------|------|
| Sprint 1 | 项目初始化、登录、Dashboard、行为记录 |
| Sprint 2 | 审核中心、惩罚执行、豁免机制 |
| Sprint 3 | 管理后台（用户/配对/分类/规则/奖励，含批量操作） |
| Sprint 4 | 奖励商城、历史记录、数据统计 |
| Sprint 5 | PWA 支持、通知、导出 Excel、响应式打磨 |
