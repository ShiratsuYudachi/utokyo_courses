const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

// 确定脚本扩展名（Windows 使用 cmd，其他系统使用 sh）
const isWindows = os.platform() === 'win32';
const shellCmd = isWindows ? 'cmd' : 'sh';
const shellArgs = isWindows ? ['/c'] : ['-c'];

console.log('正在启动东京大学课程浏览器服务...');

// 启动后端服务
console.log('启动后端服务 (端口 3001)...');
const backendProcess = spawn('node', ['backend.js'], {
  stdio: 'pipe',
  shell: true
});

backendProcess.stdout.on('data', (data) => {
  console.log(`[后端] ${data.toString().trim()}`);
});

backendProcess.stderr.on('data', (data) => {
  console.error(`[后端错误] ${data.toString().trim()}`);
});

// 等待 2 秒后启动前端服务，确保后端服务先初始化
setTimeout(() => {
  console.log('启动前端服务 (端口 3000)...');
  const frontendProcess = spawn('node', ['server.js'], {
    stdio: 'pipe',
    shell: true
  });

  frontendProcess.stdout.on('data', (data) => {
    console.log(`[前端] ${data.toString().trim()}`);
  });

  frontendProcess.stderr.on('data', (data) => {
    console.error(`[前端错误] ${data.toString().trim()}`);
  });

  // 显示访问链接
  frontendProcess.stdout.on('data', (data) => {
    if (data.toString().includes('running at')) {
      console.log('\n====================================');
      console.log('服务已启动！访问下列地址：');
      console.log('中文版: http://localhost:3000');
      console.log('英文版: http://localhost:3000/index_en.html');
      console.log('====================================\n');
    }
  });

  // 处理前端进程退出
  frontendProcess.on('close', (code) => {
    console.log(`前端服务已停止，退出码 ${code}`);
    // 当前端进程退出时，也终止后端进程
    backendProcess.kill();
    process.exit(code);
  });
}, 2000);

// 处理后端进程退出
backendProcess.on('close', (code) => {
  console.log(`后端服务已停止，退出码 ${code}`);
  // 如果 code 不为 0，说明异常退出，整个应用也应该退出
  if (code !== 0) {
    process.exit(code);
  }
});

// 处理进程信号
process.on('SIGINT', () => {
  console.log('接收到中断信号，正在优雅退出...');
  backendProcess.kill('SIGINT');
  process.exit(0);
});

console.log('服务启动中，请稍候...'); 