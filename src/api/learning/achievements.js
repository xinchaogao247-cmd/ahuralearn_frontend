import request from "../request";

export function getAchievementSummary() {
  return request.get("/learning/achievements/summary");
}

