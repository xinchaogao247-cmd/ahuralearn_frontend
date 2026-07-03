import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Signup from './pages/signup';
import Homepage from './pages/homepage';
import CourseDetail from './pages/courseDetail';
import VideoLearning from './pages/videoLearning';
import PostClassQuiz from './pages/postClassQuiz';
import FeatureHub from './pages/featureHub';
import CourseRecommendation from './pages/courseRecommendation';
import CourseSearch from './pages/courseSearch';
import { RequireAuth, RequireGuest } from './components/common/routeGuard';

import AiTestDashboard from './pages/aiTestDashboard';
import Feedback from './pages/feedback';
import IntelligentAnalysisSuggestions from './pages/intelligentAnalysisSuggestions';
import AdaptiveExam from './pages/adaptiveExam';
import AnswerDetails from './pages/answerDetails';

import DocumentAnalyst from './pages/documentAnalyst';
import AiSummarization from './pages/aiSummarization';
import AcademicAssistant from './pages/academicAssistant';

import AiStudyPlan from "./pages/aiStudyPlan";
import Dashboard from "./pages/dashboard";
import Courses from "./pages/courses";
import LearningPlan from "./pages/learningPlan";
import Achievements from "./pages/achievements";
import MyExam from "./pages/myExam";
import MyInformation from "./pages/myInformation";
import Notifications from "./pages/notifications";

import Report from "./pages/report";
import Game from "./pages/game";


/**
 * 初学者指南：项目的主入口组件 App.jsx
 * 在这里，我们负责“页面的分配 (把不同的 URL 路径分配给对应的组件)”。
 * 这是利用 react-router-dom 库来实现的。
 */
export default function App() {
  return (
    // Router 组件需包裹在最外层，用于监听浏览器 URL 的变化
    <Router>
      <Routes>
        {/* 当用户访问根目录时 ('/')，使用 Navigate 组件自动重定向到登录页 ('/login') */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 反向路由守卫保护的区域 (已登录用户不能再访问登录注册页) */}
        <Route element={<RequireGuest />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* 私有路由守卫保护的区域 (未登录用户不能访问这些页面) */}
        <Route element={<RequireAuth />}>
          <Route path="/homepage" element={<Homepage />} />

          <Route path="/course/:courseId">
            {/* 可以有课程主页 */}
            <Route index element={<CourseDetail />} />
            {/* 课程的游戏页，这里的 path 写相对路径 "game" 即可 */}
            <Route path="game" element={<Game />} />
          </Route>

          <Route path="/learning/:courseId/:sectionId" element={<VideoLearning />} />
          <Route path="/learning/:courseId" element={<VideoLearning />} />
          <Route path="/quiz/:sectionId" element={<PostClassQuiz />} />
          <Route path="/featureHub" element={<FeatureHub />} />
          <Route path="/courseRecommendation/:sessionId?" element={<CourseRecommendation />} />
          <Route path="/search" element={<CourseSearch />} />

          <Route path="/aiTestDashboard" element={<AiTestDashboard />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/analysis" element={<IntelligentAnalysisSuggestions />} />
          <Route path="/exam" element={<AdaptiveExam />} />

          {/* TODO: 可能会调整路径 */}
          <Route path="/answerDetails/*" element={<AnswerDetails />} />

          <Route path="/documentAnalyst" element={<DocumentAnalyst />} />
          <Route path="/aiSummarization" element={<AiSummarization />} />
          <Route path="/academicAssistant" element={<AcademicAssistant />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/learningPlan" element={<LearningPlan />} />
          <Route path="/aiStudyPlan" element={<AiStudyPlan />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/myExam" element={<MyExam />} />
          <Route path="/myInformation" element={<MyInformation />} />
          <Route path="/notifications" element={<Notifications />} />

          <Route path="/performanceInsight" element={<Report />} />
        </Route>

        {/* （可选）用来处理所有的错误或者未注册路径，比如 404 页面 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
