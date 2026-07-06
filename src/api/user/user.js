import request from '../request';

export const login = (data) => {
  return request.post('/auth/login', data);
};

export const register = (data) => {
  return request.post('/auth/register', data);
};

export const checkUsername = (username) => {
  return request.get(`/auth/users/exists?username=${username}`);
};

export const getSimpleInfo = () => {
  return request.get('/user/simpleInfo');
};

export const logoutAccount = async () => {
  return request.post('/auth/logout');
};

// GXC
import { myInformationMock } from './MyInformationMock';

// My Information 页面接口：默认使用 mock 数据。
// 模块专用开关 VITE_USE_MOCK_MY_INFO 优先于全局 VITE_USE_MOCK_API，
// 这样只把本模块切到真实后端，其它模块继续用 mock。
const useMockApi =
  (import.meta.env.VITE_USE_MOCK_MY_INFO ?? import.meta.env.VITE_USE_MOCK_API) !== 'false';
const mockDelay = 500;

// 统一模拟接口响应延迟，保持页面 loading 效果和真实请求接近。
function mockResponse(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, mockDelay);
  });
}

// 获取 My Information 页面初始化数据，包括个人信息、学习统计和学习档案。
export async function getMyInformationPageData() {
  if (useMockApi) {
    return mockResponse(myInformationMock);
  }

  return request.get('/api/profile');
}

// 更新用户基础资料，例如姓名、角色、简介等。
// 后端接收扁平的 DTO，这里把页面的 {profile, learningProfile} 结构拍平。
export async function updateProfile(pageData) {
  if (useMockApi) {
    return mockResponse(pageData);
  }

  const { profile, learningProfile } = pageData;

  return request.put('/api/profile', {
    name: profile.name,
    role: profile.role,
    description: profile.description,
    avatar: profile.avatar,
    age: learningProfile.age,
    gender: learningProfile.gender,
    region: learningProfile.region,
    birthday: learningProfile.birthday,
    education: learningProfile.education,
    occupation: learningProfile.occupation,
    skills: Array.isArray(learningProfile.skills)
      ? learningProfile.skills.join(', ')
      : learningProfile.skills,
  });
}

// 更新用户学习档案，例如学习目标、偏好方向和当前学习重点。
export async function updateLearningProfile(learningProfileData) {
  if (useMockApi) {
    return mockResponse(learningProfileData);
  }

  return request.put('/profile/learningProfile', learningProfileData);
}

// 上传用户头像，真实接口接收 FormData。
export async function uploadAvatar(formData) {
  if (useMockApi) {
    return mockResponse({
      avatarUrl: '/mock-avatar.png',
    });
  }

  return request.post('/profile/avatar', formData);
}

// 分享用户资料或学习档案。
export async function shareProfile(data) {
  if (useMockApi) {
    return mockResponse({
      success: true,
    });
  }

  return request.post('/profile/share', data);
}
