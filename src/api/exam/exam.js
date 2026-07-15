import request from '../request'; // 引入你们封装好的请求工具

// ==========================================
// 第一部分：题库后台管理接口 (CRUD)
// ==========================================

// 添加新题目 (Create - POST)
export function addQuestion(data) {
  return request.post('/api/questions', data);
}
// 获取单道题详情 (Read - GET)
export function getQuestionById(id) {
  return request.get(`/api/questions/${id}`);
}
// 修改题目 (Update - PUT)
export function updateQuestion(id, data) {
  return request.put(`/api/questions/${id}`, data);
}
// 删除题目 (Delete - DELETE)
export function deleteQuestion(id) {
  return request.delete(`/api/questions/${id}`);
}


// ==========================================
// 第二部分：前端考试核心业务接口
// ==========================================


// ------------------------------------------
// 🔴 【真实后端接口 - 开发阶段暂时注释】 🔴
// 等待后端提供真实 API 后，删除注释即可无缝切换
// ------------------------------------------

/*

// 获取整套考试的题目 (GET)
export function getExamQuestions(assessmentId) {
  return request.get(`/api/assessments/${assessmentId}/questions`);
}
// 获取可选的测试模块/课程列表 (GET 真实接口)
export function getAvailableCourses() {
  return request.get('/api/courses');
}

// 提交考试卷 (POST)
// 当请求失败时，大页面的 catch 逻辑会触发，将数据存入 localStorage 并跳转到 recommendations
export function submitExam(assessmentId, submissionData) {
  return request.post(`/api/assessments/${assessmentId}/submit`, submissionData);
}
export function getDashboardSummary() {
  return request.get('/api/assessments/dashboard');
}

export function getAssessmentDetails(assessmentId = 'latest') {
  return request.get(`/api/assessments/${assessmentId}/details`);
}

export function sendChatMessage(message) {
  return request.post('/api/chat/completions', { message });
}

*/


// ------------------------------------------
// 🟢 【前端 Mock 模拟接口 - 当前生效】 🟢
// 用于在没有后端的情况下，跑通整个系统的完美闭环
// ------------------------------------------

// 💡 辅助函数：模拟后端的假数据库读写
const saveToMockDB = (data) => localStorage.setItem('mockBackendDB', JSON.stringify(data));
const getFromMockDB = () => JSON.parse(localStorage.getItem('mockBackendDB') || 'null');

// 1. 获取整套考试的题目 (GET 模拟)
export function getExamQuestions(assessmentId = 'latest') {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: [
          {
            id: 12,
            type: 'multiple-choice',
            difficulty: 4,
            topic: 'Supervised Learning',
            question: "In the context of supervised learning, what is the primary purpose of a 'Validation Set' compared to a 'Test Set'?",
            options: [
              { id: 'first', text: "To provide a final evaluation of the model performance." },
              { id: 'second', text: "To tune hyperparameters and prevent overfitting during training." },
              { id: 'third', text: "To increase the size of the training dataset." },
              { id: 'fourth', text: "To label previously unlabelled data points." }
            ],
            correctAnswer: 'second'
          },
          {
            id: 18,
            type: 'true-false',
            difficulty: 5,
            topic: 'Neural Networks',
            question: "Regularization in neural networks is primarily used to increase the model's complexity to better fit the training data.",
            correctAnswer: 'false'
          },
          {
            id: 19,
            type: 'short-answer',
            difficulty: 5,
            topic: 'Overfitting',
            question: "Explain the concept of Overfitting in the context of machine learning and how it affects model performance on unseen data.",
            correctAnswer: null
          }
        ]
      });
    }, 500);
  });
}

// 2. 提交考试卷 (POST 模拟)
export function submitExam(assessmentId, submissionData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟后端：接收到前端发来的试卷和时间，存进本地假数据库
      saveToMockDB(submissionData);
      console.log("✅ 模拟后端已成功接收试卷！包含真实时间数据:", submissionData.timeStats);
      resolve({ data: { message: "Success" } });
    }, 600);
  });
}

// 3. 获取推荐页报告 (GET) -> 修复 Question Review 颜色
export function getDashboardSummary() {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 🌟 去本地数据库查一下，用户有没有交过卷？
      const db = getFromMockDB(); 
      
      // 🌟 如果没有交卷记录（新用户），直接返回 null 告诉前端没有数据
      if (!db) {
        return resolve({ data: null }); 
      }

// 🌟 既然考过了，就把真实数据拿出来算分！
      const { answers, timeStats } = db;
      
      // 动态判卷（和推荐页一样的逻辑）
      const testResults = [
        { id: '12', isCorrect: answers['12'] === 'second' },
        { id: '18', isCorrect: answers['18'] === 'false' },
        { id: '19', isCorrect: true } 
      ];
      const correctCount = testResults.filter(r => r.isCorrect).length;
      const realScore = Math.round((correctCount / 3) * 100);

      // 动态算时间
      const totalSeconds = timeStats?.totalTimeSeconds || 0;
      const realFormattedTime = `${Math.floor(totalSeconds / 60)} mins ${totalSeconds % 60} secs`;

      // 获取今天的真实日期
      const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      // 如果有记录，正常返回图表和分数数据
      resolve({
        data: {
          skills: [
            // 雷达图的数值也跟着你的真实分数浮动
            { name: 'Problem Solving', value: realScore, className: 'green' }, 
            { name: 'Speed', value: 70, className: 'blue' },
            { name: 'Accuracy', value: realScore, className: 'orange' }
          ],
          summary: {
            score: realScore, // 真实分数！
            maxScore: 100,
            improvement: 14,
            date: today, // 真实今天日期！
            duration: realFormattedTime, // 真实花费时间！
            focusArea: realScore < 100 ? "Supervised Learning" : "All Mastered"
          }
        }
      });
    }, 800); 
  });
}

// 4. 获取错题详情 (GET) -> 修复真实用时和答案对比
export function getAssessmentReport(assessmentId = 'latest') {
  return new Promise((resolve) => {
    setTimeout(() => {
      const db = getFromMockDB();
      if (!db) return resolve({ data: { overviewStats: { score: 0 }, testResults: [] }});

      const { answers } = db;
      
      const testResults = [
        { id: '12', isCorrect: answers['12'] === 'second' },
        { id: '18', isCorrect: answers['18'] === 'false' },
        { id: '19', isCorrect: true } 
      ];

      const correctCount = testResults.filter(r => r.isCorrect).length;
      const score = Math.round((correctCount / 3) * 100);

      resolve({
        data: {
          overviewStats: { score, focusArea: score < 100 ? 'Supervised Learning' : 'All Mastered', strength: 'Data Logic', weakness: 'N/A' },
          testResults 
        }
      });
    }, 500); 
  });
}

// 5. 获取错题详情 (GET)
export function getAssessmentDetails(assessmentId = 'latest') {
  return new Promise((resolve) => {
    setTimeout(() => {
      const db = getFromMockDB();
      if (!db) return resolve({ data: { meta: {}, questions: [] }});

      const { answers, shortAnswers, timeStats } = db;
      
      const totalSeconds = timeStats?.totalTimeSeconds || 0;
      const formattedTime = `${Math.floor(totalSeconds / 60)} mins ${totalSeconds % 60} secs`;

      resolve({
        data: {
          meta: { totalDuration: formattedTime },
          questions: [
            {
              id: 12,
              type: 'multiple-choice',
              topic: 'Supervised Learning',
              question: "In the context of supervised learning, what is the primary purpose of a 'Validation Set' compared to a 'Test Set'?",
              options: [
                { id: 'first', text: "To provide a final evaluation of the model performance." },
                { id: 'second', text: "To tune hyperparameters and prevent overfitting during training." },
                { id: 'third', text: "To increase the size of the training dataset." },
                { id: 'fourth', text: "To label previously unlabelled data points." }
              ],
              correctAnswer: 'second',
              userAnswer: answers['12'], 
              isCorrect: answers['12'] === 'second',
              explanation: "The validation set is used during the training phase to tune parameters and prevent overfitting."
            },
            {
              id: 18,
              type: 'true-false',
              topic: 'Neural Networks',
              question: "Regularization in neural networks is primarily used to increase the model's complexity to better fit the training data.",
              correctAnswer: 'false',
              userAnswer: answers['18'],
              isCorrect: answers['18'] === 'false',
              explanation: "Regularization actually penalizes complexity to prevent overfitting."
            },
            {
              id: 19,
              type: 'short-answer',
              topic: 'Overfitting',
              question: "Explain the concept of Overfitting in the context of machine learning and how it affects model performance on unseen data.",
              correctAnswer: null,
              userAnswer: shortAnswers['19'] || "No answer provided.",
              isCorrect: true, 
              explanation: "Excellent answer! Overfitting refers to a model learning the noise in the training data rather than the underlying pattern."
            }
          ]
        }
      });
    }, 600);
  });
}

// AI 助手聊天接口 (POST)
export function sendChatMessage(message) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          reply: `This is an AI response from the API to your message: "${message}". Once connected to your backend API, real dynamic answers will appear here!`
        }
      });
    }, 1500); 
  });
}

// 获取可选的测试模块/课程列表 (GET 模拟)
export function getAvailableCourses() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: [
          { id: 'module-001', name: 'React Hooks Basics' },
          { id: 'module-002', name: 'Java Advanced Programming' },
          { id: 'module-003', name: 'Supervised Machine Learning' },
          { id: 'module-004', name: 'Data Structures & Algorithms' }
        ]
      });
    }, 600); // 模拟网络延迟
  });
}

// GXC
export async function getMyExamPageData() {
  return request.get("/api/v1/exam/my-exam");
}