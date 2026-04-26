const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8238;
const DATA_FILE = path.join(__dirname, 'data.json');

const DEFAULT_CATEGORIES = [
  { id: 'cat_default',   name: '默认',   icon: '📋', order: 0 },
  { id: 'cat_touzi',     name: '投资',   icon: '💰', order: 1 },
  { id: 'cat_dianshiju', name: '电视剧', icon: '🎬', order: 2 },
  { id: 'cat_dianying',  name: '电影',   icon: '🎥', order: 3 },
  { id: 'cat_shuji',     name: '书籍',   icon: '📚', order: 4 },
  { id: 'cat_youxi',     name: '游戏',   icon: '🎮', order: 5 }
];

function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return { categories: DEFAULT_CATEGORIES, todos: [] };
    }
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    // 兼容旧数据（无 categories 字段）
    if (!data.categories || !Array.isArray(data.categories)) {
      data.categories = DEFAULT_CATEGORIES;
    }
    // 旧待办没有 categoryId，补上默认分类
    if (data.todos && Array.isArray(data.todos)) {
      data.todos.forEach(t => { if (!t.categoryId) t.categoryId = 'cat_default'; });
    }
    return data;
  } catch (e) {
    return { categories: DEFAULT_CATEGORIES, todos: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const PRESET_ICONS = [
  '📋','📌','📍','💰','💎','💳','🎬','🎥','🎞️','📺',
  '📚','📖','📕','🎮','🕹️','🎯','⚽','🏀','🎸','🎨',
  '🍳','☕','🍺','🍜','🏠','🚗','✈️','💼','🏢','📱',
  '💻','🔧','🔬','📊','📈','📉','🧘','🏃','🌱','🌸',
  '🎁','⭐','🔥','💡','⚡','🎉','🎊','👀','✔️','❌',
  '🗑️','✏️','📝','📧','🛒','🎒','🏋️','🧗','🚴','🏊',
  '🎵','🎤','📷','🖼️','🌅','🏞️','🌺','🍀','🌻','🌹',
  '🍎','🍕','🎂','🍦','🧃','🍷','🏨','🛵'
];

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // /api/categories
  if (pathname === '/api/categories') {
    res.setHeader('Content-Type', 'application/json');
    if (req.method === 'GET') {
      const data = readData();
      res.writeHead(200);
      res.end(JSON.stringify(data.categories.sort((a, b) => a.order - b.order)));
      return;
    }
    if (req.method === 'POST') {
      let body = ''; req.on('data', c => body += c); req.on('end', () => {
        try {
          const { name, icon } = JSON.parse(body);
          if (!name || !name.trim()) { res.writeHead(400); res.end(JSON.stringify({ error: '名称不能为空' })); return; }
          const data = readData();
          const newCat = { id: 'cat_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5), name: name.trim(), icon: icon || '📋', order: data.categories.length };
          data.categories.push(newCat); writeData(data);
          res.writeHead(201); res.end(JSON.stringify(newCat));
        } catch (e) { res.writeHead(400); res.end(JSON.stringify({ error: 'Invalid JSON' })); }
      }); return;
    }
    res.writeHead(404); res.end(JSON.stringify({ error: 'Not found' })); return;
  }

  // /api/categories/reorder — 调整分类顺序
  if (pathname === '/api/categories/reorder' && req.method === 'PATCH') {
    res.setHeader('Content-Type', 'application/json');
    let body = ''; req.on('data', c => body += c); req.on('end', () => {
      try {
        const { order } = JSON.parse(body); // order = [id1, id2, ...]
        if (!Array.isArray(order)) { res.writeHead(400); res.end(JSON.stringify({ error: 'order must be array' })); return; }
        const data = readData();
        order.forEach((id, idx) => {
          const cat = data.categories.find(c => c.id === id);
          if (cat) cat.order = idx;
        });
        writeData(data);
        res.writeHead(200); res.end(JSON.stringify({ success: true }));
      } catch (e) { res.writeHead(400); res.end(JSON.stringify({ error: 'Invalid JSON' })); }
    }); return;
  }

  // /api/categories/:id
  const catMatch = pathname.match(/^\/api\/categories\/([^/]+)$/);
  if (catMatch) {
    const catId = catMatch[1]; res.setHeader('Content-Type', 'application/json');
    if (req.method === 'PATCH') {
      let body = ''; req.on('data', c => body += c); req.on('end', () => {
        try {
          const { name, icon } = JSON.parse(body);
          const data = readData();
          const cat = data.categories.find(c => c.id === catId);
          if (!cat) { res.writeHead(404); res.end(JSON.stringify({ error: '分类不存在' })); return; }
          if (name !== undefined) { if (!name.trim()) { res.writeHead(400); res.end(JSON.stringify({ error: '名称不能为空' })); return; } cat.name = name.trim(); }
          if (icon !== undefined) cat.icon = icon;
          writeData(data); res.writeHead(200); res.end(JSON.stringify(cat));
        } catch (e) { res.writeHead(400); res.end(JSON.stringify({ error: 'Invalid JSON' })); }
      }); return;
    }
    if (req.method === 'DELETE') {
      const data = readData();
      if (!data.categories.find(c => c.id === catId)) { res.writeHead(404); res.end(JSON.stringify({ error: '分类不存在' })); return; }
      data.todos = data.todos.filter(t => t.categoryId !== catId);
      data.categories = data.categories.filter(c => c.id !== catId);
      writeData(data); res.writeHead(200); res.end(JSON.stringify({ success: true })); return;
    }
    res.writeHead(404); res.end(JSON.stringify({ error: 'Not found' })); return;
  }

  // /api/icons
  if (pathname === '/api/icons') {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200); res.end(JSON.stringify(PRESET_ICONS)); return;
  }

  // /api/todos
  if (pathname === '/api/todos') {
    res.setHeader('Content-Type', 'application/json');
    if (req.method === 'GET') {
      const data = readData();
      let todos = data.todos;
      const catId = parsedUrl.query.categoryId;
      if (catId) todos = todos.filter(t => t.categoryId === catId);
      res.writeHead(200); res.end(JSON.stringify(todos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))); return;
    }
    if (req.method === 'POST') {
      let body = ''; req.on('data', c => body += c); req.on('end', () => {
        try {
          const { title, categoryId } = JSON.parse(body);
          if (!title || !title.trim()) { res.writeHead(400); res.end(JSON.stringify({ error: 'Title is required' })); return; }
          const data = readData();
          const validCat = data.categories.find(c => c.id === categoryId);
          const usedCatId = validCat ? categoryId : 'cat_default';
          const newTodo = { id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9), title: title.trim(), completed: false, categoryId: usedCatId, createdAt: new Date().toISOString() };
          data.todos.unshift(newTodo); writeData(data);
          res.writeHead(201); res.end(JSON.stringify(newTodo));
        } catch (e) { res.writeHead(400); res.end(JSON.stringify({ error: 'Invalid JSON' })); }
      }); return;
    }
    res.writeHead(404); res.end(JSON.stringify({ error: 'Not found' })); return;
  }

  // /api/todos/:id
  const todoMatch = pathname.match(/^\/api\/todos\/([^/]+)$/);
  if (todoMatch) {
    const todoId = todoMatch[1]; res.setHeader('Content-Type', 'application/json');
    if (req.method === 'PATCH') {
      let body = ''; req.on('data', c => body += c); req.on('end', () => {
        try {
          const updates = JSON.parse(body);
          const data = readData();
          const todo = data.todos.find(t => t.id === todoId);
          if (!todo) { res.writeHead(404); res.end(JSON.stringify({ error: 'Todo not found' })); return; }
          if (updates.title !== undefined) { if (!updates.title || !updates.title.trim()) { res.writeHead(400); res.end(JSON.stringify({ error: 'Title cannot be empty' })); return; } todo.title = updates.title.trim(); }
          if (updates.completed !== undefined) todo.completed = updates.completed;
          if (updates.categoryId !== undefined) todo.categoryId = updates.categoryId;
          writeData(data); res.writeHead(200); res.end(JSON.stringify(todo));
        } catch (e) { res.writeHead(400); res.end(JSON.stringify({ error: 'Invalid JSON' })); }
      }); return;
    }
    if (req.method === 'DELETE') {
      const data = readData();
      const idx = data.todos.findIndex(t => t.id === todoId);
      if (idx === -1) { res.writeHead(404); res.end(JSON.stringify({ error: 'Todo not found' })); return; }
      data.todos.splice(idx, 1); writeData(data);
      res.writeHead(200); res.end(JSON.stringify({ success: true })); return;
    }
    res.writeHead(404); res.end(JSON.stringify({ error: 'Not found' })); return;
  }

  // Static files
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(__dirname, filePath);
  const ext = path.extname(filePath);
  const mimeType = MIME_TYPES[ext] || 'text/plain';
  fs.readFile(filePath, (err, content) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': mimeType }); res.end(content);
  });
});

server.listen(PORT, '0.0.0.0', () => { console.log(`TODO App running on ${PORT}`); });
