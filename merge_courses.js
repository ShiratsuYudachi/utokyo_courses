#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio'); // 确保已安装: npm install cheerio

async function main() {
  // 获取当前脚本所在目录
  const currentDir = __dirname;
  
  // 读取目录中的所有文件
  fs.readdir(currentDir, (err, files) => {
    if (err) {
      console.error(`读取目录失败: ${currentDir}`);
      process.exit(1);
    }
    
    // 筛选所有 .html 文件
    const htmlFiles = files.filter(file => file.endsWith('.html'));
    console.log(`找到 ${htmlFiles.length} 个HTML文件`);
    
    let allCourses = [];
    
    // 处理每个HTML文件
    htmlFiles.forEach(file => {
      const filePath = path.join(currentDir, file);
      console.log(`处理文件: ${file}`);
      
      try {
        const html = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(html);
        
        // 查找表格行
        $('tr').each((i, element) => {
          // 跳过表头行
          if (i === 0) return;
          
          const tds = $(element).find('td');
          if (tds.length < 10) return; // 确保有足够的列
          
          // 提取课程信息
          const courseInfo = {
            index: $(tds[0]).text().trim(),
            term: $(tds[1]).text().trim(),
            schedule: $(tds[2]).text().trim(),
            level: $(tds[3]).text().trim(),
            department: $(tds[4]).text().trim(),
            location: $(tds[5]).text().trim(),
            notes: $(tds[6]).text().trim(),
            courseCode: $(tds[7]).text().trim(),
            faculty: $(tds[8]).text().trim(),
            major: $(tds[9]).text().trim(),
            courseName: $(tds[10]).text().trim(),
            instructor: $(tds[11]).text().trim()
          };
          
          // 只添加有课程名的记录
          if (courseInfo.courseName) {
            allCourses.push(courseInfo);
          }
        });
      } catch (error) {
        console.error(`处理文件 ${file} 时出错:`, error);
      }
    });
    
    // 写入合并后的 JSON 文件
    const mergedPath = path.join(currentDir, 'all_courses.json');
    fs.writeFileSync(mergedPath, JSON.stringify(allCourses, null, 2), 'utf8');
    console.log(`合并的课程数据已写入 ${mergedPath}`);
    console.log(`总共处理了 ${allCourses.length} 门课程`);
    
    // 根据课程名去重
    const courseMap = new Map();
    allCourses.forEach(course => {
      if (!courseMap.has(course.courseName)) {
        courseMap.set(course.courseName, course);
      }
    });
    
    const uniqueCourses = Array.from(courseMap.values());
    const uniquePath = path.join(currentDir, 'unique_courses.json');
    fs.writeFileSync(uniquePath, JSON.stringify(uniqueCourses, null, 2), 'utf8');
    console.log(`去重后的课程数据已写入 ${uniquePath}`);
    console.log(`去重后共有 ${uniqueCourses.length} 门课程`);
  });
}

main(); 