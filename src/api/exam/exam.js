import request from '../request'; // 引入你们封装好的请求工具

/* ==========================================
 * Question Bank Management (CRUD)
 * ========================================== */

// Create Question
export function addQuestion(data) {
  return request.post("/api/questions", data);
}

// Read Question
export function getQuestionById(id) {
  return request.get(`/api/questions/${id}`);
}

// Update Question
export function updateQuestion(id, data) {
  return request.put(`/api/questions/${id}`, data);
}

// Delete Question
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
 * 获取考试题目
 * GET /api/questions/list?moduleId={courseId}
 */
export function getExamQuestions(courseId) {
  return request.get(`/api/questions/list?moduleId=${courseId}`);
}

/*
 * 提交考试
 * POST /api/assessments/submit
 */
export function submitExam(submissionData) {
  return request.post("/api/assessments/submit", submissionData);
}


//TODO 一样的
/*
 * 获取考试报告
 * GET /api/assessments/report/{assessmentId}
 */
export function getAssessmentReport(assessmentId) {
  return request.get(`/api/assessments/report/${assessmentId}`);
}

/*
 * 获取考试历史记录
 * GET /api/assessments/history
 */
export function getAssessmentHistory() {
  return request.get("/api/assessments/history");
}

/*
 * 获取考试详情
 * 当前与 Report 使用同一个接口
 */
export function getAssessmentDetails(assessmentId) {
  return request.get(`/api/assessments/report/${assessmentId}`);
}

/*
 * 获取可参加考试课程
 * （仅返回当前用户已完成课程）
 *
 * 新接口：
 * GET /course/assessment
 */
export function getAvailableCourses() {
  return request.get("/api/courses");
}

/*
 * Dashboard Summary
 */
export function getDashboardSummary() {
  return request.get("/api/assessments/dashboard");
}

/*
 * AI Chat
 */
export function sendChatMessage(message) {
  const assessmentId = localStorage.getItem("latestAssessmentId");
  return request.post("/api/ai/chat", { 
    message: message, 
    recordId: assessmentId || "" 
  });
}


// GXC
export async function getMyExamPageData() {
  return request.get("/api/v1/exam/my-exam");
}