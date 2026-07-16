import request from "../request";

export function getLearningDashboard() {
  return request.get("/learning/dashboard");
}