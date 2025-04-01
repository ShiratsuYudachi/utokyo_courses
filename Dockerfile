FROM node:18-slim

WORKDIR /app

# 复制依赖配置文件
COPY package*.json ./

# 安装依赖
RUN npm install --legacy-peer-deps

# 复制所有文件到容器
COPY . .

# 暴露前端和后端端口
EXPOSE 3000 3001

# 启动命令
CMD ["node", "start.js"] 