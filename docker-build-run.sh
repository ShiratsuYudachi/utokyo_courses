#!/bin/bash

echo "===== 东京大学课程浏览器 Docker 构建与运行脚本 ====="
echo "1. 构建 Docker 镜像"
docker build -t utokyo-courses .

echo "\n2. 运行容器"
docker run -d -p 3000:3000 -p 3001:3001 --name utokyo-courses-container utokyo-courses

echo "\n3. 容器已启动"
echo "   中文版访问地址: http://localhost:3000"
echo "   英文版访问地址: http://localhost:3000/index_en.html"
echo "   停止容器命令: docker stop utokyo-courses-container"
echo "   删除容器命令: docker rm utokyo-courses-container"
echo "=====================================================" 