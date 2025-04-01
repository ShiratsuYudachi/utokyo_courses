const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const tf = require('@tensorflow/tfjs-node');
const use = require('@tensorflow-models/universal-sentence-encoder');

// 创建Express应用
const app = express();
const PORT = 3001;

// 启用CORS
app.use(cors());
app.use(express.json());

// 存储数据和模型
let uniqueCourses = [];
let courseVectors = {};
let useModel = null;
let isModelLoaded = false;

// 初始化数据和模型
async function initialize() {
  console.log('正在初始化后端服务...');
  
  try {
    // 加载课程数据
    console.log('加载课程数据...');
    const uniqueCoursesData = fs.readFileSync(path.join(__dirname, 'unique_courses.json'), 'utf8');
    uniqueCourses = JSON.parse(uniqueCoursesData);
    console.log(`成功加载 ${uniqueCourses.length} 门课程`);
    
    // 加载模型
    console.log('加载语义搜索模型...');
    useModel = await use.load();
    isModelLoaded = true;
    console.log('模型加载完成');
    
    // 预处理课程向量（可选，取决于内存限制）
    console.log('预处理课程向量...');
    await generateCourseVectors();
    console.log('课程向量生成完成');
  } catch (error) {
    console.error('初始化过程中出错:', error);
  }
}

// 生成课程向量
async function generateCourseVectors() {
  if (!isModelLoaded || !useModel) return;
  
  const courseNames = uniqueCourses.map(course => course.courseName || '').filter(name => name !== '');
  
  if (courseNames.length === 0) return;
  
  try {
    // 批量生成向量 - 为了避免内存问题，我们分批处理
    const batchSize = 100; // 每批处理的课程数量
    
    for (let i = 0; i < courseNames.length; i += batchSize) {
      const batchEnd = Math.min(i + batchSize, courseNames.length);
      const currentBatch = courseNames.slice(i, batchEnd);
      
      console.log(`处理课程向量 (${i + 1}-${batchEnd}/${courseNames.length})...`);
      
      const embeddings = await useModel.embed(currentBatch);
      const vectors = embeddings.arraySync();
      
      // 将向量与课程名称关联
      for (let j = 0; j < currentBatch.length; j++) {
        courseVectors[currentBatch[j]] = vectors[j];
      }
    }
  } catch (error) {
    console.error('生成课程向量时出错:', error);
  }
}

// 计算余弦相似度
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (normA * normB);
}

// 语义搜索API端点
app.post('/api/semantic-search', async (req, res) => {
  const { query, filters } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: '搜索词不能为空' });
  }
  
  if (!isModelLoaded) {
    return res.status(503).json({ error: '模型尚未加载完成，请稍后再试' });
  }
  
  try {
    console.log(`处理语义搜索请求: "${query}"`);
    
    // 先应用过滤器
    let filteredCourses = uniqueCourses;
    
    if (filters) {
      filteredCourses = uniqueCourses.filter(course => {
        // 学期过滤
        const matchesTerm = !filters.term || course.term === filters.term;
        
        // 级别过滤
        const matchesLevel = !filters.level || course.level === filters.level;
        
        // 院系过滤
        const matchesDepartment = !filters.department || course.department === filters.department;
        
        return matchesTerm && matchesLevel && matchesDepartment;
      });
    }
    
    // 生成查询向量
    const queryEmbedding = await useModel.embed([query]);
    const queryVector = queryEmbedding.arraySync()[0];
    
    // 计算相似度并排序
    const results = filteredCourses.map(course => {
      if (!course.courseName || !courseVectors[course.courseName]) {
        return { course, similarity: 0 };
      }
      
      const similarity = cosineSimilarity(queryVector, courseVectors[course.courseName]);
      return { course, similarity };
    })
    .filter(item => item.similarity > 0.3) // 设置相似度阈值
    .sort((a, b) => b.similarity - a.similarity);
    
    // 将相似度信息添加到课程对象中
    const resultCourses = results.map(item => {
      return {
        ...item.course,
        semanticSimilarity: item.similarity
      };
    });
    
    console.log(`找到 ${resultCourses.length} 门相关课程`);
    res.json({ courses: resultCourses });
  } catch (error) {
    console.error('语义搜索过程中出错:', error);
    res.status(500).json({ error: '处理请求时出错' });
  }
});

// 检查服务状态API端点
app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    modelLoaded: isModelLoaded,
    courseCount: uniqueCourses.length,
    vectorsGenerated: Object.keys(courseVectors).length
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`后端服务运行在 http://localhost:${PORT}`);
  initialize();
}); 