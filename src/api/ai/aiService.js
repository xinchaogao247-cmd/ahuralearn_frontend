import request from '../request';

/**
 * 获取左侧边栏的历史会话列表
 */
export const fetchHistorySessions = () => {
  return request.get('/api/ai/sessions');
};

/**
 * 根据会话ID获取某个历史会话的具体聊天记录
 * @param {string|number} sessionId 会话ID
 */
export const fetchSessionMessages = (sessionId) => {
  return request.get(`/api/ai/sessions/${sessionId}/messages`);
};

/**
 * 发送用户关于课程推荐的提问
 * @param {object} payload 包含 { sessionId, userMessage }
 */
export const sendRecommendMessage = (payload) => {
  return request.post('/api/ai/recommend', payload);
};

// ─── Document Analyst & Academic Assistant ──────────────────────────────────
// These call the local Spring backend. The shared `request` baseURL points
// elsewhere, so each call passes `baseURL: ''` to send a relative URL that Vite
// proxies to :8080. (request.js is never modified.)


/**
 * Upload one course material (multipart/form-data).
 * Backend: POST /api/documents/upload → { documentId, filename, size, status }.
 * @param {File} file
 */
export const uploadDocument = (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post('/api/documents/upload', formData, {
    headers: { 'Content-Type': undefined },
    onUploadProgress,
  });
};

/**
 * List the user's already-uploaded documents (used to repopulate the upload
 * list after a page refresh, since the files persist server-side).
 * Backend: GET /api/documents → DocumentVo[].
 */
export const fetchDocuments = () => {
  return request.get('/api/documents');
};

/**
 * Permanently delete an uploaded document (file + DB record) so it does not
 * reappear after a refresh. Backend: DELETE /api/documents/{id}.
 * @param {string|number} documentId
 */
export const deleteDocument = (documentId) => {
  return request.delete(`/api/documents/${documentId}`);
};

/**
 * Get a document's AI summary + key points.
 * Backend: GET /api/summarization/{id}.
 * @param {string|number} documentId
 */
export const fetchSummary = (documentId) => {
  // LLM summarization can take 20s+, so override the short default axios timeout
  return request.get(`/api/summarization/${documentId}`, { timeout: 120000 });
};

/**
 * Regenerate a document's summary (returns { message, documentId }; re-fetch after).
 * Backend: POST /api/summarization/{id}/regenerate.
 * @param {string|number} documentId
 */
export const regenerateSummary = (documentId) => {
  return request.post(`/api/summarization/${documentId}/regenerate`, null);
};

/**
 * Ask the AI tutor about a document. Maps { userMessage } → backend { message }.
 * Backend: POST /api/assistant/chat → { role, text, documentId }.
 * @param {object} payload { documentId, userMessage }
 */
export const sendSummaryChat = ({ documentId, userMessage }) => {
  // LLM tutor reply can be slow → allow up to 2 min instead of the 10s default
  return request.post('/api/assistant/chat', { message: userMessage, documentId }, { timeout: 120000 });
};

/**
 * Real-time Academic Assistant: send a free-form query, get structured analysis.
 * Backend: POST /api/assistant/analyze → { inquiry, definition, explanation, keyPoints, sources }.
 * @param {string} query
 */
export const analyzeQuery = (query) => {
  // LLM analysis can be slow → allow up to 2 min instead of the 10s default
  return request.post('/api/assistant/analyze', { query }, { timeout: 120000 });
};

// GXC
import { aiStudyPlanMock } from "./aiStudyPlanMock";

const useMockApi = import.meta.env.VITE_USE_MOCK_API !== "false";
const mockDelay = 300;

/**
 * 模拟接口延迟，方便本地开发时观察真实请求的加载状态。
 * @param {*} data 需要返回的模拟数据
 * @returns {Promise<*>}
 */
function mockResponse(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, mockDelay);
  });
}

/**
 * 获取 AI 学习计划页面初始化数据。
 * @returns {Promise<object>}
 */
export async function getAIStudyPlanData() {
  if (useMockApi) {
    return mockResponse(aiStudyPlanMock);
  }

  return request.get("/aiStudyPlan");
}

/**
 * 向 AI 学习计划对话发送一条用户消息。
 * @param {string} message 用户输入内容
 * @returns {Promise<object>}
 */
export async function sendAIStudyPlanMessage(message) {
  if (useMockApi) {
    return mockResponse({
      role: "assistant",
      message: "Thanks, I will generate a study plan based on your answer.",
    });
  }

  return request.post("/aiStudyPlan/chat", {
    message,
  });
}

/**
 * 获取 AI 学习计划生成过程日志。
 * @returns {Promise<Array<string>>}
 */
export async function getAIStudyPlanLogs() {
  if (useMockApi) {
    return mockResponse(aiStudyPlanMock.aiLogs);
  }

  return request.get("/aiStudyPlan/logs");
}

/**
 * 获取 AI 推荐的学习模块列表。
 * @returns {Promise<Array<object>>}
 */
export async function getRecommendedModules() {
  if (useMockApi) {
    return mockResponse(aiStudyPlanMock.recommendedModules);
  }

  return request.get("/aiStudyPlan/modules");
}

/**
 * 根据用户配置生成 AI 学习计划。
 * @param {object} data 生成学习计划所需的用户配置
 * @returns {Promise<object>}
 */
export async function generateAIStudyPlan(data) {
  if (useMockApi) {
    return mockResponse({
      success: true,
      studyPlan: data,
    });
  }

  return request.post("/aiStudyPlan/generate", data);
}

/**
 * 获取 AI 学习计划生成状态。
 * @returns {Promise<object>}
 */
export async function getAIStudyPlanStatus() {
  if (useMockApi) {
    return mockResponse({
      status: "LIVE_UPDATES",
    });
  }

  return request.get("/aiStudyPlan/status");
}