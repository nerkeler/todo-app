# ✨ TODO App

一个优雅的待办事项管理应用，局域网多端同步。

## 快速开始

```bash
cd todo-app
node server.js
```

然后访问 http://localhost:3000

**局域网访问：** 在同一 WiFi 下，使用服务器 IP 访问，如 http://192.168.1.x:3000

## 功能

- ✅ 添加 / 完成 / 删除待办
- 💾 数据本地 JSON 存储
- 🌐 局域网多端访问
- 🎨 优雅的渐变 UI 设计
- 📱 移动端适配

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/todos | 获取所有任务 |
| POST | /api/todos | 添加任务 |
| PATCH | /api/todos/:id | 更新任务状态 |
| DELETE | /api/todos/:id | 删除任务 |
