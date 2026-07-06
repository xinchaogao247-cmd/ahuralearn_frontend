import request from '../request';

/**
 * Get quiz status and score overview
 * @param {string|number} sectionId 
 */
export const getQuizOverview = (sectionId) => {
  return request.get(`/section-quizzes/${sectionId}/overview`);
};

/**
 * Retrieve questions and user's answers
 * @param {string|number} sectionId 
 */
export const getQuizDetails = (sectionId) => {
  return request.get(`/section-quizzes/${sectionId}`);
};

/**
 * Submit quiz answers
 * @param {string|number} sectionId 
 * @param {Array<{questionId: number, userAnswer: string}>} answers 
 */
export const submitQuiz = (sectionId, answers) => {
  return request.post(`/section-quizzes/${sectionId}/submit`, answers);
};
