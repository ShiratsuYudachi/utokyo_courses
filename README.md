# 东京大学课程浏览器本地服务器

这个项目提供了本地 HTTP 服务器，用于访问东京大学课程浏览器的网页，以及处理语义搜索功能的后端服务。

## 前提条件

确保你的系统已安装 [Node.js](https://nodejs.org/)。

安装必要的依赖：

```bash
npm install express cors @tensorflow/tfjs-node @tensorflow-models/universal-sentence-encoder --legacy-peer-deps
```

## 启动服务

### 方法一：使用集成启动脚本（推荐）

使用集成启动脚本可以同时启动前端和后端服务：

```bash
node start.js
```

这个脚本会自动启动后端服务和前端服务，并在控制台显示详细的日志信息。

### 方法二：分别启动服务

#### 1. 启动前端服务器

```bash
node server.js
```

前端服务器将在端口 3000 上启动。

#### 2. 启动后端服务（用于语义搜索）

```bash
node backend.js
```

后端服务将在端口 3001 上启动，并自动加载语义搜索模型和课程数据。

### 方法三：使用 Docker（新增）

如果您已安装 Docker 和 Docker Compose，可以使用以下命令快速启动服务：

#### 使用 Docker Compose（推荐）

```bash
docker-compose up -d
```

#### 手动构建和运行 Docker 镜像

```bash
# 构建镜像
docker build -t utokyo-courses .

# 运行容器
docker run -p 3000:3000 -p 3001:3001 utokyo-courses
```

### 3. 访问网站

在浏览器中访问:
- [http://localhost:3000](http://localhost:3000) 查看中文版网页
- [http://localhost:3000/index_en.html](http://localhost:3000/index_en.html) 查看英文版网页

## 系统结构

### 前端服务器 (server.js)

- 提供静态文件服务
- 自动将根路径 `/` 重定向到 `index.html`
- 支持常见文件类型的正确 MIME 类型
- 提供基本的错误处理和 404 页面
- 在控制台记录请求日志

### 后端服务 (backend.js)

- 负责处理语义搜索请求
- 在启动时加载课程数据和语义搜索模型
- 提供 API 接口进行语义搜索
- 预处理课程向量，提高搜索性能

### 集成启动脚本 (start.js)

- 同时启动前端和后端服务
- 统一管理进程日志输出
- 处理优雅退出和错误情况
- 自动打印访问链接

## API 接口

### 检查服务状态

```
GET http://localhost:3001/api/status
```

返回后端服务的状态信息，包括模型加载状态、课程数量等。

### 语义搜索

```
POST http://localhost:3001/api/semantic-search
```

请求体示例：

```json
{
  "query": "人工智能",
  "filters": {
    "term": "S1",
    "level": "学部",
    "department": "工学系研究科"
  }
}
```

- `query`: 搜索关键词（必填）
- `filters`: 过滤条件（可选）
  - `term`: 学期
  - `level`: 级别
  - `department`: 院系

## 前端与后端通信

前端页面会自动尝试连接后端服务。当用户启用语义搜索功能时，前端会将搜索请求发送到后端进行处理，然后展示结果。

如果后端服务未启动或连接失败，前端会自动回退到关键词搜索模式。

## 优势

- 语义搜索从前端迁移到后端，减轻用户浏览器负担
- 向量计算在服务器端完成，无需在客户端下载和加载模型
- 预处理课程向量，提高搜索响应速度
- 兼容各种浏览器和设备，不再有移动设备兼容性问题

## 停止服务器

- 如果使用集成启动脚本：在终端按 `Ctrl+C` 组合键可以同时停止前端和后端服务
- 如果分别启动服务：需要在各自的终端按 `Ctrl+C` 组合键停止对应服务
- 如果使用 Docker Compose：运行 `docker-compose down` 停止服务

## Docker 部署注意事项

- 镜像基于 Node.js 18 slim 版本构建，体积较小
- 容器中的服务运行在相同的端口（3000和3001）
- 课程数据文件 (`all_courses.json` 和 `unique_courses.json`) 通过卷映射到容器
- 支持自动重启功能，除非手动停止

## 目录结构

- `server.js` - 前端 HTTP 服务器代码
- `backend.js` - 后端语义搜索服务代码
- `start.js` - 集成启动脚本
- `index.html` - 中文版课程浏览器
- `index_en.html` - 英文版课程浏览器
- `404.html` - 自定义 404 错误页面
- `all_courses.json` - 所有课程数据
- `unique_courses.json` - 去重后的课程数据
- `Dockerfile` - Docker 镜像构建配置
- `docker-compose.yml` - Docker Compose 配置

## 注意事项

这个服务器仅用于本地开发和测试目的，不适合在生产环境中使用。对于生产环境，应考虑更健壮的部署方案，如使用 Docker 容器化和负载均衡等技术。 