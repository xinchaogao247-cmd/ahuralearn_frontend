import request from "../request";

// 获取游戏列表
export const getGames = async (courseId) => {
  return request.get(
    `/api/v1/courses/${courseId}/games`
  );
};

// 获取游戏说明
export const getGameInstruction = async (
  courseId,
  gameCode
) => {
  return request.get(
    `/api/v1/courses/${courseId}/games/${gameCode}/instruction`
  );
};

// 获取挑战题目
export const getChallengeQuestions = async (
  courseId,
  gameCode
) => {
  return request.get(
    `/api/v1/courses/${courseId}/games/${gameCode}/challenge-questions`
  );
};

// 获取 Code Firewall 题目
export const getSyntaxShieldItems = async (
  courseId
) => {
  return request.get(
    `/api/v1/courses/${courseId}/games/code-firewall/syntax-items`
  );
};

// 获取 Concept Sorter 题目
export const getKnowledgeDefenseQuestions = async (
  courseId
) => {
  return request.get(
    `/api/v1/courses/${courseId}/games/concept-sorter/questions`
  );
};

// 获取 Concept Sorter 配置
export const getKnowledgeDefenseConfig = async (
  courseId
) => {
  return request.get(
    `/api/v1/courses/${courseId}/games/concept-sorter/config`
  );
};

// 提交游戏结果
export const submitGameResult = async (
  gameResult
) => {
  return request.post(
    `/api/v1/courses/${gameResult.courseId}/games/result`,
    gameResult
  );
};