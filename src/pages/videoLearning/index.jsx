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
import videoErrorImg from '../../assets/images/emptyStates/video_error.png';

export default function VideoLearning() {
  const { courseId, sectionId } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [showErrorState, setShowErrorState] = useState(false);

  const [courseInfo, setCourseInfo] = useState({});
  const [lessonList, setLessonList] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);

  const [currentLesson, setCurrentLesson] = useState(null);
  const [lastWatchTime, setLastWatchTime] = useState(0);

  useEffect(() => {
    if (!courseId || !sectionId) return;

    const fetchLearningData = async () => {
      try {
        setIsLoading(true);
        setShowErrorState(false);

        const [detailsRes, progressRes, urlRes] = await Promise.all([
          getCoursePlayDetails(courseId, sectionId),
          getPlaybackProgress(courseId, sectionId),
          getPlaybackUrl(courseId, sectionId)
        ]);

        let detailsData = detailsRes;
        let progressData = progressRes;
        let playUrl = urlRes;

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
          if (idx > 0 && flatSections[idx - 1].status === 'completed' && s.status === 'locked') {
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
        // no matter business exception or HTTP error
        showToast(err.message || "Failed to load learning details", "error");
        setShowErrorState(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLearningData();
  }, [courseId, sectionId]);

  // trigger by CourseSidebar
  const handleSelectLesson = (lessonVideo) => {

    if (lessonVideo.status === 'locked') return;

    navigate(`/learning/${courseId}/${lessonVideo.id}`);
  };

  // trigger by watching the video over 70%
  const handleLessonCompleted = async (completedLessonId) => {
    try {
      const progressRes = await getPlaybackProgress(courseId, sectionId);

      setLessonList(prevList => {
        let flatSections = [];
        const completedIds = new Set(progressRes?.completedSectionIds || []);

        completedIds.add(completedLessonId);

        let newChapters = prevList.map(chapter => {
          const newSections = (chapter.sections || []).map(section => {
            let status = 'locked';

            if (completedIds.has(section.id) || String(section.id) === String(completedLessonId)) {
              status = 'completed';
            }
            const s = { ...section, status };
            flatSections.push(s);
            return s;
          });
          return { ...chapter, sections: newSections };
        });

        flatSections.forEach((s, idx) => {
          if (idx === 0 && s.status === 'locked') s.status = 'unlocked';
          if (idx > 0 && flatSections[idx - 1].status === 'completed' && s.status === 'locked') {
            s.status = 'unlocked';
          }
        });

        newChapters = newChapters.map(chapter => {
          return {
            ...chapter,
            sections: chapter.sections.map(sec => {
              const matched = flatSections.find(f => String(f.id) === String(sec.id));
              return matched || sec;
            })
          };
        });

        const total = flatSections.length;
        const completed = flatSections.filter(s => s.status === 'completed').length;
        setOverallProgress(total > 0 ? Math.round((completed / total) * 100) : 0);

        return newChapters;
      });
    } catch (error) {
      console.error("Failed to update lessons progress", error);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <TopNav />
      {/* loading */}
      {isLoading && <div className={styles.loadingWrapper}>Loading course materials...</div>}

      {/* empty state */}
      {showErrorState && !isLoading && (
        <main className={styles.mainContent}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            Back
          </button>
          <div className={styles.emptyStateContainer}>
            <img src={videoErrorImg} alt="Failed to load video" className={styles.emptyStateImage} />
            <p className={styles.emptyStateText}>Oops! We can't seem to find or play the video you're looking for.</p>
          </div>
        </main>
      )}

      {!isLoading && !showErrorState && (
        <main className={styles.mainContent}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            Back
          </button>

          <div className={styles.gridContent}>

            <div className={styles.leftColumn}>

              {currentLesson && (
                <VideoPlayer
                  lesson={currentLesson}
                  lastWatchTime={lastWatchTime}
                  onLessonComplete={handleLessonCompleted}
                />
              )}

              <LessonTabs
                description={currentLesson?.description}
                tags={currentLesson?.tags}
                sectionId={currentLesson?.id}
                title={currentLesson?.title}
              />
            </div>

            <div className={styles.rightColumn}>
              <CourseSidebar
                overallProgress={overallProgress}
                lessonList={lessonList}
                currentLessonId={currentLesson?.id}
                onSelectLesson={handleSelectLesson}
              />

              {courseInfo.instructor && (
                <LessonInstructorCard instructorDetails={courseInfo.instructor} />
              )}
            </div>
          </div>
        </main>
      )}
      {!showErrorState && <Footer />}
    </div>
  );
}
