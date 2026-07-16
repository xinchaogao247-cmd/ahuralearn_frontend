import request from "../request";

export async function getLearningPlanData(pageNum = 1, pageSize = 3) {
  const pageData = await request.get("/learning/plan", {
    params: {
      pageNum,
      pageSize,
    },
  });

  return {
    planner: {
      tasks: pageData.records || [],
    },
    pagination: {
      total: pageData.total || 0,
      pages: pageData.pages || 0,
      pageNum: pageData.pageNum || pageNum,
      pageSize: pageData.pageSize || pageSize,
    },
  };
}

export async function createStudyPlan(newPlan) {
  return request.post("/learning/plan", newPlan);
}

export async function updateStudyPlan(id, updatedPlan) {
  return request.put(`/learning/plan/${id}`, updatedPlan);
}

export async function deleteStudyPlan(id) {
  return request.delete(`/learning/plan/${id}`);
}

export async function completeStudyPlan(id) {
  return request.patch(`/learning/plan/${id}/complete`);
}

export async function generateAIStudyPlan(data) {
  return request.post("/learningPlan/aiSuggest", data);
}
