import request from "../request";

export async function getNotificationsData(params = {}) {
  return request.get("/notifications", { params });
}

export async function acknowledgeNotification(notificationId) {
  return request.patch(`/notifications/${notificationId}/acknowledge`);
}

export async function deleteNotification(notificationId) {
  return request.delete(`/notifications/${notificationId}`);
}
