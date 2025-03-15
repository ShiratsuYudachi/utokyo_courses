#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio'); // 请确保已运行：npm install cheerio
async function main() {
// 目标目录为当前文件所在目录下的 utokyo_courses
const coursesFolder = path.join(dirname, 'utokyo_courses');
fs.readdir(coursesFolder, (err, files) => {
if (err) {
console.error("Failed to read directory: "+${coursesFolder});
process.exit(1);
}
// 筛选所有 .html 文件
const htmlFiles = files.filter(file => file.endsWith('.html'));
let allCourses = [];
htmlFiles.forEach(file => {
const filePath = path.join(coursesFolder, file);
console.log("Processing file: "${filePath});
const html = fs.readFileSync(filePath, 'utf8');
const $ = cheerio.load(html);
// 根据实际 HTML 结构调整选择器，这里假设课程信息在 div.course-item 中
$('div.course-item').each((i, element) => {
const name = $(element).find('.course-name').text().trim();
const code = $(element).find('.course-code').text().trim();
const details = $(element).find('.course-details').text().trim();
// 如果找到课名，则认为该项为有效课程记录
if (name) {
allCourses.push({ name, code, details });
}
});
});
// 写入合并后的 JSON 文件
const mergedPath = path.join(dirname, 'courses.json');
fs.writeFileSync(mergedPath, JSON.stringify(allCourses, null, 2), 'utf8');
console.log(Merged courses written to ${mergedPath});
// 根据课名字段去重
const seenNames = new Set();
const dedupedCourses = allCourses.filter(course => {
if (seenNames.has(course.name)) return false;
seenNames.add(course.name);
return true;
});
const dedupedPath = path.join(dirname, 'courses_deduplicated.json');
fs.writeFileSync(dedupedPath, JSON.stringify(dedupedCourses, null, 2), 'utf8');
console.log("Deduplicated courses written to" ${dedupedPath});
});
}
main();
