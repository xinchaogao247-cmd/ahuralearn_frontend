import request from "../request";

const useMockApi =
  import.meta.env.VITE_USE_MOCK_API === "true";

const mockDelay = 300;

function mockResponse(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, mockDelay);
  });
}

/**
 * 获取当前登录用户可查看报告的课程。
 *
 * 后端接口：
 * GET /api/v1/report/courses
 */
export async function getReportCourses() {
  if (useMockApi) {
    return mockResponse([]);
  }

  /*
   * request.js 的响应拦截器已经执行：
   *
   * return result.data;
   *
   * 因此这里拿到的 response
   * 已经是后端 Result.data，也就是课程数组。
   */
  const response = await request.get(
    "/api/v1/report/courses"
  );

  console.log(
    "getReportCourses API response:",
    response
  );

  return Array.isArray(response)
    ? response
    : [];
}

/**
 * 获取指定课程的分析报告。
 *
 * 后端接口：
 * GET /api/v1/report
 *
 * 参数：
 * courseId
 */
export async function getReportData(courseId) {
  if (
    courseId === null ||
    courseId === undefined ||
    courseId === ""
  ) {
    throw new Error("courseId is required");
  }

  if (useMockApi) {
    return mockResponse(null);
  }

  /*
   * request.js 已经返回 Result.data，
   * 所以 response 就是报告对象。
   */
  const response = await request.get(
    "/api/v1/report",
    {
      params: {
        courseId,
      },
    }
  );

  console.log(
    "getReportData API response:",
    response
  );

  return response ?? null;
}