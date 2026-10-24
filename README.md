# 心理健康 AI 助手

基于 Vue 3 + Vite 的心理健康助手前端应用。同一个工程内包含 **用户端** 与 **管理后台** 两套界面：用户可以与大模型进行流式心理咨询、记录情绪日记、浏览心理健康知识文章；管理员可以在后台查看文章、咨询记录、情绪日志与数据看板。

> 本项目为个人学习项目，部分展示信息（如后台用户名、头像）为固定值，未做生产级配置。

## 功能概览

### 用户端

- **首页**：产品介绍与咨询、情绪日记入口
- **AI 咨询**：SSE 流式对话、历史会话列表与删除、会话情绪分析（情绪名称 / 评分 / 风险等级 / 改善建议）
- **情绪日记**：1–10 情绪评分、8 种主要情绪、睡眠质量与压力水平、触发因素与日记正文
- **知识库**：文章列表（推荐阅读 + 分页）、文章详情（富文本渲染、标签展示）
- **账户**：登录、注册、退出登录

### 管理后台

- **数据分析**：用户 / 日记 / 会话 / 平均情绪四张统计卡，情绪趋势、咨询会话、用户活跃度三张 ECharts 图表
- **知识文章**：分类与状态筛选、富文本编辑、封面上传、发布 / 下线 / 删除
- **咨询记录**：会话分页列表、会话详情与完整对话记录
- **情绪日志**：按用户 ID 与评分区间查询、日志详情、删除、AI 情绪分析结果查看

## 技术栈

| 类别 | 选型 |
| --- | --- |
| 框架 | Vue 3（`<script setup>`） |
| 构建 | Vite |
| 路由 | vue-router 4 |
| 状态管理 | Pinia |
| UI 组件 | Element Plus（`unplugin-vue-components` 按需引入）+ `@element-plus/icons-vue` |
| HTTP | axios |
| 流式通信 | `@microsoft/fetch-event-source` |
| 图表 | ECharts（`echarts/core` 按需注册） |
| 富文本 | wangEditor（弹窗首次打开时异步加载） |
| Markdown | marked + DOMPurify |
| 其他 | dayjs、sass |

## 快速开始

环境要求：Node.js（开发环境使用 22.20.0，建议使用 LTS 版本）、npm（仓库包含 `package-lock.json`）。

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建，产物输出到 dist/
npm run build

# 本地预览生产构建
npm run preview
```

## 环境变量

变量在 `.env.development` / `.env.production` 中配置，由 Vite 注入到 `import.meta.env`。

| 变量 | 说明 |
| --- | --- |
| `VITE_API_BASE_URL` | 接口请求前缀，默认 `/api` |
| `VITE_PROXY_TARGET` | 仅开发环境使用，`/api` 代理的目标后端地址 |
| `VITE_FILE_BASE_URL` | 后端静态资源（封面等）服务地址，用于拼接非 `http` 开头的图片路径 |

开发环境下 `/api` 由 Vite dev server 代理到 `VITE_PROXY_TARGET`（默认 `http://159.75.169.224:1235`），因此本地不涉及跨域。生产环境 `VITE_API_BASE_URL` 仍为 `/api`，需要由网关或 Nginx 把 `/api` 转发到后端服务。

> 注意：若生产站点以 HTTPS 访问，`VITE_FILE_BASE_URL` 也应使用 HTTPS，否则封面图片会因混合内容被浏览器拦截。

## 目录结构

```
src/
├── api/                 # 按业务域拆分的接口封装
│   ├── analytics.js     # 数据看板
│   ├── auth.js          # 登录 / 注册 / 退出
│   ├── chat.js          # 会话与消息
│   ├── emotion.js       # 情绪日记
│   └── knowledge.js     # 文章、分类、文件上传
├── assets/images/       # 项目内图片资源
├── components/          # 预留的通用组件目录
├── config/index.js      # apiBaseUrl / fileBaseUrl
├── router/index.js      # 三套布局路由 + 全局守卫
├── store/
│   ├── auth.js          # 登录态、角色
│   └── admin.js         # 后台侧边栏折叠状态
├── utils/
│   ├── auth.js          # token / userInfo 的 localStorage 读写
│   ├── pagination.js    # 分页参数归一化
│   ├── request.js       # axios 实例与拦截器
│   └── sanitize.js      # DOMPurify 统一净化
└── views/
    ├── auth/            # 登录、注册、认证页布局
    ├── backend/         # 管理后台（布局、导航、业务页面）
    ├── frontend/        # 用户端（布局、首页、咨询、情绪、知识库）
    └── NotFound.vue     # 404
public/
├── avatars/             # 后台列表使用的头像
└── icons.svg, favicon.svg
```

## 路由与权限

| 路径 | 说明 | 权限 |
| --- | --- | --- |
| `/` | 首页 | 公开 |
| `/consultation` | AI 咨询 | 需登录 |
| `/emotion-diary` | 情绪日记 | 需登录 |
| `/frontendKnowledge` | 知识库列表 | 需登录 |
| `/knowledge/article/:id` | 文章详情 | 需登录 |
| `/auth/login`、`/auth/register` | 登录、注册 | 公开（已登录时按角色跳首页） |
| `/back/dashboard` | 数据看板 | 仅管理员 |
| `/back/knowledge` | 知识文章管理 | 仅管理员 |
| `/back/consultations` | 咨询记录 | 仅管理员 |
| `/back/emotional` | 情绪日志 | 仅管理员 |

守卫逻辑位于 `src/router/index.js`：

- 未登录访问 `/back/*` 或带 `meta.requiresAuth` 的页面 → 跳转登录页，并通过 `redirect` 记录来源，登录成功后回跳（仅允许站内地址）。
- 已登录访问 `/auth/*` → 管理员回 `/back/dashboard`，普通用户回 `/`。
- `userInfo.userType === '2'` 视为管理员，普通用户无法进入后台。

## 后端接口约定

- **鉴权**：请求头携带 `token`；登录接口返回 `{ token, userInfo }`。
- **响应结构**：统一的 `{ code, msg, data }`。`code` 为 `200`（数字或字符串）时，拦截器直接返回 `data`；其余情况提示 `msg` 并 reject。
- **登录过期**：`code` 为 `401`，或 `-1` 且 `msg` 含 “登录” 时，清理登录态并跳登录页；并发请求下 1.5 秒内只处理一次。
- **分页**：前端统一使用 `currentPage`，同时冗余携带 `page`，以兼容后端不同命名（详见 `src/utils/pagination.js`）。
- **流式对话**：`POST /psychological-chat/stream` 返回 `text/event-stream`，正文为 JSON（`data.content` 为增量文本），`event: done` 表示本次回复结束。该请求不经过 axios 拦截器，401 处理在页面内完成。

### 接口清单

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| POST | `/user/login` | 登录 |
| POST | `/user/add` | 注册 |
| POST | `/user/logout` | 退出登录 |
| POST | `/psychological-chat/session/start` | 创建会话 |
| POST | `/psychological-chat/stream` | 流式对话（SSE） |
| GET | `/psychological-chat/sessions` | 分页查询会话 |
| DELETE | `/psychological-chat/sessions/{id}` | 删除会话 |
| GET | `/psychological-chat/sessions/{id}/messages` | 会话消息 |
| GET | `/psychological-chat/session/{id}/emotion` | 会话情绪分析 |
| POST | `/emotion-diary` | 新增情绪日记 |
| GET | `/emotion-diary/admin/page` | 后台分页查询日记 |
| DELETE | `/emotion-diary/admin/{id}` | 后台删除日记 |
| GET | `/knowledge/category/tree` | 文章分类 |
| GET | `/knowledge/article/page` | 分页查询文章 |
| GET | `/knowledge/article/{id}` | 文章详情 |
| POST | `/knowledge/article` | 新建文章 |
| PUT | `/knowledge/article/{id}` | 更新文章 |
| PUT | `/knowledge/article/{id}/status` | 发布 / 下线（1 发布，2 下线） |
| DELETE | `/knowledge/article/{id}` | 删除文章 |
| POST | `/file/upload` | 文件上传（FormData） |
| GET | `/data-analytics/overview` | 看板汇总数据 |

## 开发约定

- **错误提示集中处理**：业务错误由 `src/utils/request.js` 统一弹出 `ElMessage`，页面内 `catch` 只做状态恢复，不重复提示。
- **HTML 渲染必须净化**：所有 `v-html` 内容先经 `src/utils/sanitize.js` 的 `sanitizeHtml` 处理（文章正文、编辑器预览、AI Markdown 回复）。
- **Element Plus 按需引入**：模板中的组件由 `unplugin-vue-components` 自动引入；通过 JS 调用的 `ElMessage` / `ElMessageBox` / `v-loading` 需要显式 import 并在 `src/main.js` 中引入对应样式。
- **动态组件不经插件解析**：`TableSearch.vue` 中 `:is` 使用的组件直接 import 组件对象。
- **流式渲染**：增量文本按 80ms 缓冲合并后再更新视图，切换会话或卸载组件时通过 `AbortController` 中止旧流。

## 构建部署

```bash
npm run build
```

将 `dist/` 部署到静态服务器，并确保 `/api` 反向代理到后端，例如 Nginx：

```nginx
location /api/ {
    proxy_pass http://<backend-host>:<port>/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# SSE 接口需关闭缓冲，避免流式内容被网关攒包
location /api/psychological-chat/stream {
    proxy_pass http://<backend-host>:<port>/api/psychological-chat/stream;
    proxy_http_version 1.1;
    proxy_set_header Connection '';
    proxy_buffering off;
    proxy_read_timeout 3600s;
}
```
