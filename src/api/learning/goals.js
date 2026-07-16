import request from "../request";

export const getGoals = () => request.get("/learning/goals");

export const createGoal = (goalData) =>
  request.post("/learning/goals", goalData);

export const updateGoal = (id, goalData) =>
  request.put(`/learning/goals/${id}`, goalData);

export const completeGoal = (id) =>
  request.patch(`/learning/goals/${id}/complete`);

export const deleteGoal = (id) =>
  request.delete(`/learning/goals/${id}`);

export const getWeeklyGoals = getGoals;
export const addWeeklyGoal = createGoal;
export const deleteWeeklyGoal = deleteGoal;
