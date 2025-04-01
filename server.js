const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 定义服务器端口
const PORT = 3000;

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  // 记录请求日志
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // 解析请求的 URL
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // 将 / 请求重定向到 index.html
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  // 获取请求文件的完整路径
  const filePath = path.join(__dirname, pathname);
  
  // 获取文件扩展名
  const extname = path.extname(filePath);
  
  // 定义文件类型映射
  const contentTypeMap = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
  };
  
  // 设置内容类型
  const contentType = contentTypeMap[extname] || 'text/plain';
  
  // 读取文件
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // 文件不存在，返回 404 页面或生成简单的 404 响应
        fs.readFile(path.join(__dirname, '404.html'), (readErr, errorContent) => {
          if (readErr) {
            // 如果 404.html 也不存在，返回简单的错误信息
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`<html><body><h1>404 Not Found</h1><p>The requested URL ${pathname} was not found on this server.</p></body></html>`);
          } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(errorContent, 'utf-8');
          }
        });
      } else {
        // 服务器错误
        console.error(`Server error: ${err.code} for path: ${filePath}`);
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // 成功响应
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`You can access the English version at http://localhost:${PORT}/index_en.html`);
  console.log(`Press Ctrl+C to stop the server`);
}); 