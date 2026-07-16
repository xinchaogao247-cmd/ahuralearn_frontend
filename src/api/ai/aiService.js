import request from '../request';

/**
 * 获取左侧边栏的历史会话列表
 * 接口路径: GET /ai/course/sessions
 * 响应数据: List<ChatSessionVO> -> [{ sessionId, title }]
 */
export const fetchHistorySessions = () => {
  return request.get('/ai/course/sessions');
};

/**
 * 根据会话ID获取某个历史会话的具体聊天记录
 * 接口路径: GET /ai/course/sessions/{sessionId}/messages
 * 响应数据: List<ChatMessageVO> -> [{ messageId, role, content }]
 * @param {string} sessionId 会话ID（字符串类型，切勿转为 Number）
 */
export const fetchSessionMessages = (sessionId) => {
  return request.get(`/ai/course/sessions/${sessionId}/messages`);
};

/**
 * 发送用户关于课程推荐的提问（与 AI 对话）- SSE 流式接口
 * 接口路径: POST /ai/course/chat
 * 请求体 ChatRequestDTO: { sessionId, message }
 * @param {object} payload 包含 { sessionId: string|null, message: string }
 * @param {function} onMessage 回调函数，接收解析后的内容
 * @param {function} onSessionId 回调函数，接收新会话的ID
 */
import { fetchEventSource } from '@microsoft/fetch-event-source';

export const sendCourseChatStream = async (payload, handlers) => {
  const { onSessionId, onText, onCourseCard, onErrorEvent, onDone, onOpen, signal } = handlers;
  const token = localStorage.getItem('accessToken');
  let hasTerminalEvent = false;

  return fetchEventSource('http://localhost:8081/ai/course/chat', {
    method: 'POST',
    signal,
    openWhenHidden: true,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'accessToken': token } : {})
    },
    body: JSON.stringify(payload),
    async onopen(response) {
      if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
        if (onOpen) onOpen(response);
        return; // stream started successfully
      } else {
        // If authentication failed or parameter error occurred, server might return regular JSON Result
        throw new Error(`Failed to establish SSE stream. Status: ${response.status}`);
      }
    },
    async onmessage(msg) {
      if (msg.event === 'session_id') {
        if (onSessionId) onSessionId(msg.data);
      } else if (msg.event === 'text') {
        let textData = msg.data.replace(/\\n/g, '\n');
        if (onText) onText(textData);
      } else if (msg.event === 'ui_course') {
        if (onCourseCard) onCourseCard(JSON.parse(msg.data));
      } else if (msg.event === 'error') {
        hasTerminalEvent = true;
        if (onErrorEvent) onErrorEvent(JSON.parse(msg.data));
      } else if (msg.event === 'done') {
        hasTerminalEvent = true;
        if (onDone) onDone();
      }
    },
    onclose() {
      if (hasTerminalEvent || signal?.aborted) {
        return;
      }
      // If we haven't received done and no error was thrown, it's an abnormal close
      console.warn("SSE connection closed without receiving done event.");
      throw new Error("Abnormal close fetchEventSource to prevent infinite retry loop.");
    },
    onerror(err) {
      if (signal?.aborted) {
        return;
      }
      console.error("SSE stream network error", err);
      // Only throw actual network/library errors to stop retrying
      throw err;
    }
  });
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
 * Stored tutor conversation for a document (oldest first), used to restore the
 * chat after a page refresh. Backend: GET /api/assistant/chat/history.
 * @param {string|number} documentId
 */
export const fetchChatHistory = (documentId) => {
  return request.get('/api/assistant/chat/history', { params: { documentId } });
};

/**
 * Real-time Academic Assistant: send a free-form query, get structured analysis.
 * Backend: POST /api/assistant/analyze → { inquiry, definition, explanation, keyPoints, sources }.
 * @param {string} query
 */
export const analyzeQuery = (query, { plain = false } = {}) => {
  // LLM analysis can be slow → allow up to 2 min instead of the 10s default.
  // plain=true (e.g. Citation Generator) returns the answer as-is, no analysis structure.
  return request.post('/api/assistant/analyze', { query, plain }, { timeout: 120000 });
};

// GXC
// Previous JSON API version:
// export async function sendAIStudyPlanMessage(message) {
//   return request.post("/ai/study-plan/chat", {
//     message,
//   });
// }
//
// export async function generateAIStudyPlan(data) {
//   return request.post("/ai/study-plan/generate", data);
// }
//
// Previous stream generate API version:
// export async function generateAIStudyPlanStream(data, handlers) {
//   return streamStudyPlanRequest("/ai/study-plan/generate/stream", data, handlers);
// }

const AI_STUDY_PLAN_API_BASE_URL = 'http://localhost:8081';

const streamStudyPlanRequest = async (url, payload, handlers = {}) => {
  const { onText, onDone, onErrorEvent, onOpen, signal } = handlers;
  const token = localStorage.getItem('accessToken');
  const controller = new AbortController();
  let hasTerminalEvent = false;

  const abortStream = () => {
    controller.abort();
  };

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener('abort', abortStream, { once: true });
    }
  }

  try {
    return await fetchEventSource(`${AI_STUDY_PLAN_API_BASE_URL}${url}`, {
      method: 'POST',
      signal: controller.signal,
      openWhenHidden: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        ...(token ? { 'accessToken': token } : {})
      },
      body: JSON.stringify(payload),
      async onopen(response) {
        if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
          if (onOpen) onOpen(response);
          return;
        }

        throw new Error(`Failed to establish SSE stream. Status: ${response.status}`);
      },
      onmessage(msg) {
        const data = (msg.data || '').replace(/\\n/g, '\n');

        if (msg.event === 'text') {
          if (onText) onText(data);
        } else if (msg.event === 'done') {
          hasTerminalEvent = true;
          if (onDone) onDone();
          controller.abort();
        } else if (msg.event === 'error') {
          hasTerminalEvent = true;
          if (onErrorEvent) onErrorEvent(data || 'AI assistant is temporarily unavailable');
          controller.abort();
        }
      },
      onclose() {
        if (hasTerminalEvent || controller.signal.aborted) {
          return;
        }

        throw new Error('SSE connection closed before receiving done event.');
      },
      onerror(err) {
        if (controller.signal.aborted) {
          return;
        }

        throw err;
      }
    });
  } finally {
    if (signal) {
      signal.removeEventListener('abort', abortStream);
    }
  }
};

export async function sendAIStudyPlanMessageStream(message, handlers) {
  return streamStudyPlanRequest("/ai/study-plan/chat/stream", { message }, handlers);
}

export async function generateAndSaveAIStudyPlan(data) {
  return request.post("/ai/study-plan/generate/save", data);
}