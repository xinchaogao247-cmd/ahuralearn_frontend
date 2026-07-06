import request from '../request';

export const getHeroBanners = async () => {
  return request.get('/cms/banners');
};

export const getTrendingCourses = async () => {
  return request.get('/course/trending');
};

export const getNewRecommendations = async () => {
  return request.get('/course/new');
};

export const searchCourses = async (params) => {
  return request.get('/course/page', { params });
};

export const getCourseDetail = (courseId) => {
  return request.get(`/course/${courseId}/details`);
};

export const getSyllabus = (courseId) => {
  return request.get(`/course/${courseId}/syllabus`);
};

export const getEnrollmentStatus = (courseId) => {
  return request.get(`/lessons/${courseId}/enrollment`);
};

export const enrollCourse = (courseId) => {
  return request.post(`/lessons/${courseId}/enrollment`);
};

export const getCoursePlayDetails = (courseId, sectionId) => {
  return request.get(`/course/${courseId}/playback/${sectionId}`);
};

export const getPlaybackProgress = (courseId, sectionId) => {
  return request.get(`/lessons/${courseId}/progress`, { params: { sectionId } });
};

export const getPlaybackUrl = (courseId, sectionId) => {
  return request.get(`/course/${courseId}/sections/${sectionId}/play-url`);
};

export const saveVideoProgress = (courseId, sectionId, moment) => {
  return request.post(`/learning-records`, { courseId, sectionId, moment });
};

// GXC
import { coursesPageMock } from './coursesMock';

const useMockApi = import.meta.env.VITE_USE_MOCK_API !== 'false';
const mockDelay = 300;

function mockResponse(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, mockDelay);
  });
}

export async function getCoursesPageData() {
  if (useMockApi) {
    return mockResponse(coursesPageMock);
  }

  return request.get('/coursesPage');
}

// GZS
const mockReportCourses = [
  {
    id: 1,
    name: "Advanced Programming",
  },
  {
    id: 2,
    name: "Quantum Mechanics",
  },
  {
    id: 3,
    name: "Linear Algebra",
  },
  {
    id: 4,
    name: "Data Structures",
  },
  {
    id: 5,
    name: "Calculus",
  },
];

export const getReportCourses = async () => {
  if (useMockApi) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockReportCourses);
      }, 300);
    });
  }

  const response = await request.get(
    "/api/v1/report/courses"
  );

  return response.data;
};