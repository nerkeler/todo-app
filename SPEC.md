# TODO App Specification

## Concept & Vision

一个优雅的待办事项管理应用，采用温暖渐变配色和流畅动画。灵感来自日式极简设计，功能简洁但体验精致。每一次勾选都是一次小小的满足感。

## Design Language

**Aesthetic:** 日式禅意 + 现代卡片式设计，柔和渐变，优雅留白

**Color Palette:**
- Primary gradient: `#667eea` → `#764ba2` (薰衣草紫)
- Background: `#f8fafc` (淡灰白)
- Card: `#ffffff`
- Text primary: `#1a202c`
- Text secondary: `#718096`
- Accent success: `#38ef7d` (薄荷绿)
- Accent danger: `#ff6b6b` (珊瑚红)
- Border: `#e2e8f0`

**Typography:**
- Headings: "Noto Sans SC", system-ui, sans-serif
- Body: "Noto Sans SC", system-ui, sans-serif
- Font weights: 400 (body), 500 (medium), 700 (headings)

**Spatial System:**
- Base unit: 8px
- Card padding: 24px
- Section gap: 32px
- Border radius: 16px (cards), 12px (buttons), 8px (inputs)

**Motion Philosophy:**
- Checkbox: scale bounce + color fill, 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)
- Card appear: fade-in + slide-up, 400ms ease-out
- Delete: fade-out + slide-left, 250ms ease-in
- Button hover: subtle lift + shadow, 150ms

## Layout & Structure

**Header:** 
- 应用标题居中，带渐变色
- 当前日期显示
- 简洁的分隔线

**Main Content:**
- 添加任务区域：圆角输入框 + 添加按钮
- 任务列表：卡片式，每个任务一行
- 底部统计：已完成/总数

**Responsive:**
- 桌面：居中卡片，最大宽度 640px
- 移动端：全宽，左右 padding 16px

## Features & Interactions

### 添加任务
- 输入框 placeholder: "添加新任务..."
- Enter 或点击按钮添加
- 空内容不添加，输入框抖动提示
- 添加后输入框清空，新任务出现在列表顶部

### 任务列表
- 显示所有任务，按创建时间倒序
- 每条任务显示：复选框 + 标题 + 删除按钮
- 复选框勾选：文字划线 + 透明度降低
- 悬停显示删除按钮

### 删除任务
- 点击删除按钮移除
- 带有淡出动画

### 数据持久化
- 使用 localStorage 保存
- 每次操作自动保存
- 页面加载时读取

### 局域网访问
- Node.js 服务端渲染 + API
- 数据存储在 data.json
- 支持跨设备访问

## Component Inventory

### Input Field
- States: default, focused, error (shake)
- 高度 48px，圆角 12px
- Focus 时边框变为渐变色

### Add Button
- 渐变背景，白色文字
- Hover: 轻微上浮 + 阴影加深
- Active: 轻微下沉

### Task Item
- 白色卡片，圆角 12px
- Checkbox: 自定义样式，渐变填充
- Title: 左对齐，可点击勾选
- Delete: 右侧红色 X，hover 时显示

### Stats Bar
- 底部固定，显示进度
- 进度条样式，渐变填充

## Technical Approach

**Frontend:** 原生 HTML + CSS + JavaScript，无框架

**Backend:** Node.js 原生 HTTP 服务端

**API Endpoints:**
- `GET /` - 返回 index.html
- `GET /api/todos` - 获取所有任务
- `POST /api/todos` - 添加任务 { title }
- `DELETE /api/todos/:id` - 删除任务
- `PATCH /api/todos/:id` - 更新任务状态

**Data Model:**
```json
{
  "todos": [
    {
      "id": "uuid",
      "title": "任务标题",
      "completed": false,
      "createdAt": "ISO timestamp"
    }
  ]
}
```

**File Structure:**
```
todo-app/
├── server.js       # Node.js 服务端
├── data.json       # 数据存储
├── index.html      # 主页面
├── SPEC.md         # 本规格文档
└── README.md       # 说明文档
```
