import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TopNav from '../../components/common/TopNav';
import Footer from '../../components/common/Footer';
import VideoPlayer from '../../components/videoLearning/VideoPlayer';
import CourseSidebar from '../../components/videoLearning/CourseSidebar';
import LessonTabs from '../../components/videoLearning/LessonTabs';
import LessonInstructorCard from '../../components/videoLearning/LessonInstructorCard';
import styles from './VideoLearning.module.css';
import { getCoursePlayDetails, getPlaybackProgress, getPlaybackUrl } from '../../api/course/course';
import { showToast } from '../../components/common/toast';

export default function VideoLearning() {
  const { courseId, sectionId } = useParams();
  const navigate = useNavigate();

  // ----- 状态管理区域 -----
  // loading 状态，页面初始化时展示给用户加载提示
  const [isLoading, setIsLoading] = useState(true);
  // error 状态，捕获接口错误并展示
  const [error, setError] = useState(null);

  // 课程整体信息（讲师、基础描述等）
  const [courseInfo, setCourseInfo] = useState({});
  // 课程所有课时列表
  const [lessonList, setLessonList] = useState([]);
  // 总体学习进度百分比（例如 35%）
  const [overallProgress, setOverallProgress] = useState(0);

  // 当前正在播放的课时详细信息（我们需要传给子组件的）
  const [currentLesson, setCurrentLesson] = useState(null);
  // 上次观看的时间进度秒数，用于断点续播
  const [lastWatchTime, setLastWatchTime] = useState(0);

  // ----- 生命周期与副作用区域 -----
  // useEffect：在组件挂载和 courseId 发生变化时，向后端请求课程详细数据
  useEffect(() => {
    if (!courseId || !sectionId) return;

    const fetchLearningData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [detailsRes, progressRes, urlRes] = await Promise.all([
          getCoursePlayDetails(courseId, sectionId),
          getPlaybackProgress(courseId, sectionId),
          getPlaybackUrl(courseId, sectionId)
        ]);

        let detailsData = detailsRes;
        let progressData = progressRes;
        let playUrl = urlRes;

        if (!detailsData || !progressData) {
          throw new Error("Incomplete data returned from server");
        }

        setCourseInfo({ instructor: detailsData.instructor });
        
        const completedIds = new Set(progressData.completedSectionIds || []);
        let flatSections = [];

        const chapters = (detailsData.chapters || []).map(chapter => {
          const newSections = (chapter.sections || []).map(section => {
            let status = 'locked';
            if (completedIds.has(section.id)) {
              status = 'completed';
            }
            const s = { ...section, status };
            flatSections.push(s);
            return s;
          });
          return { ...chapter, sections: newSections };
        });

        // Simple pass left-to-right to unlock
        flatSections.forEach((s, idx) => {
          if (idx === 0 && s.status === 'locked') s.status = 'unlocked';
          if (idx > 0 && flatSections[idx-1].status === 'completed' && s.status === 'locked') {
             s.status = 'unlocked';
          }
        });

        setLessonList(chapters);

        const currentSec = detailsData.currentSection;
        let targetLesson = flatSections.find(s => String(s.id) === String(sectionId));
        if (!targetLesson && flatSections.length > 0) {
           targetLesson = flatSections[0];
           navigate(`/learning/${courseId}/${targetLesson.id}`, { replace: true });
        }

        if (targetLesson) {
           setCurrentLesson({
             ...targetLesson,
             description: currentSec?.description || targetLesson.description,
             title: currentSec?.title || targetLesson.title,
             videoUrl: typeof playUrl === 'string' ? playUrl : playUrl?.url // Handle potential object wrapping
           });
        }
        
        setLastWatchTime(progressData.moment || 0);

        const total = flatSections.length;
        const completed = flatSections.filter(s => s.status === 'completed').length;
        setOverallProgress(total > 0 ? Math.round((completed / total) * 100) : 0);

      } catch (err) {
        showToast(err.message || "Failed to load learning details", "error");
        console.error("Failed to load learning details:", err);
        setError(err.message || "Failed to load learning materials. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLearningData();
  }, [courseId, sectionId]);

  // Removed the extra sectionId watcher. Data is fetched on sectionId change.

  // ----- 事件处理函数 -----
  // 处理课程课时的点击事件（由子组件 CourseSidebar 触发）
  const handleSelectLesson = (lessonVideo) => {
    // 只有状态是 "completed" 或 "unlocked" 的课时才能点击
    if (lessonVideo.status === 'locked') return;

    // 更新当前播放课时：不直接 set state，而是改变网页 URL 路由即可，
    // 路由变更后，上面的 useEffect 会监听 sectionId 并完成 currentLesson 的切换和进度重置。
    navigate(`/learning/${courseId}/${lessonVideo.id}`);
  };

  // 处理课时观看完成的逻辑，供 VideoPlayer 子组件在达到 70% 进度时调用
  const handleLessonCompleted = async (completedLessonId) => { //实则为sectionId
    // 企业常见做法：接收子组件或请求返回的 completed 信息，
    // 获取最新进度并重算总体进度及章节解锁状态，从而刷新 CourseSidebar。
    try {
      const progressRes = await getPlaybackProgress(courseId, sectionId);
      
      setLessonList(prevList => {
        let flatSections = [];
        const completedIds = new Set(progressRes?.completedSectionIds || []);
        
        // 确保本节课必定为完成状态 (兼容后端进度未及时更新情况)
        completedIds.add(completedLessonId);

        let newChapters = prevList.map(chapter => {
          const newSections = (chapter.sections || []).map(section => {
            let status = 'locked';
            // 使用 String(id) 防止由于 Number/String 类型混用导致的对比失败
            if (completedIds.has(section.id) || String(section.id) === String(completedLessonId)) {
              status = 'completed';
            }
            const s = { ...section, status };
            flatSections.push(s);
            return s;
          });
          return { ...chapter, sections: newSections };
        });

        // 拍平遍历，更新"下一个小节被解锁"的视觉样式
        flatSections.forEach((s, idx) => {
          if (idx === 0 && s.status === 'locked') s.status = 'unlocked';
          if (idx > 0 && flatSections[idx-1].status === 'completed' && s.status === 'locked') {
             s.status = 'unlocked';
          }
        });

        // 重新赋值 updated status 给章节列表
        newChapters = newChapters.map(chapter => {
          return {
            ...chapter,
            sections: chapter.sections.map(sec => {
              const matched = flatSections.find(f => String(f.id) === String(sec.id));
              return matched || sec;
            })
          };
        });

        // 核心修复点：更新全局总体百分比
        const total = flatSections.length;
        const completed = flatSections.filter(s => s.status === 'completed').length;
        setOverallProgress(total > 0 ? Math.round((completed / total) * 100) : 0);

        return newChapters;
      });
    } catch (error) {
      console.error("Failed to update lessons progress", error);
    }
  };

  // ----- 渲染部分 -----
  return (
    <div className={styles.pageContainer}>
      <TopNav />
      {/* 优雅降级 UI：加载中或错误 */}
      {isLoading && <div className={styles.loadingWrapper}>Loading course materials...</div>}

      {error && !isLoading && (
        <main className={styles.mainContent}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            Back
          </button>
          <div className={styles.errorContainer}>
            <h2>Oops! Failed to load course.</h2>
            <p className={styles.errorMessage}>{error}</p>
            <button onClick={() => window.location.reload()} className={styles.retryButton}>
              Retry
            </button>
          </div>
        </main>
      )}

      {!isLoading && !error && (
        <main className={styles.mainContent}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            Back
          </button>
          
          <div className={styles.gridContent}>
            {/* 左侧主要区域：视频播放器 + 底部描述 Tabs */}
            <div className={styles.leftColumn}>
              {/* 传递需要的参数给视频播放组件 */}
              {currentLesson && (
                <VideoPlayer 
                  lesson={currentLesson} 
                  lastWatchTime={lastWatchTime}
                  onLessonComplete={handleLessonCompleted} 
                />
              )}

              {/* 描述和测试区域 */}
              <LessonTabs 
                description={currentLesson?.description} 
                tags={currentLesson?.tags} 
                sectionId={currentLesson?.id} 
                title={currentLesson?.title}
              />
            </div>

            {/* 右侧边栏：课时列表 + 讲师信息 */}
            <div className={styles.rightColumn}>
              <CourseSidebar 
                 overallProgress={overallProgress}
                 lessonList={lessonList}
                 currentLessonId={currentLesson?.id}
                 onSelectLesson={handleSelectLesson}
              />
              {/* 复用或者新建讲师卡片进行隔离
                  此处我们使用专为此页面隔离的 LessonInstructorCard */}
              {courseInfo.instructor && (
                 <LessonInstructorCard instructorDetails={courseInfo.instructor} />
              )}
            </div>
          </div>
        </main>
      )}

      <Footer />
    </div>
  );
}
