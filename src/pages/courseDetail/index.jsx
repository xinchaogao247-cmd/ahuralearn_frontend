import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseDetail, getSyllabus, getEnrollmentStatus, enrollCourse } from '../../api/course/course';

import TopNav from '../../components/common/TopNav';
import CourseHeader from '../../components/courseDetail/CourseHeader';
import CourseTabs from '../../components/courseDetail/CourseTabs';
import InstructorCard from '../../components/courseDetail/InstructorCard';
import Footer from '../../components/common/Footer';
import emptyStateImg from '../../assets/images/emptyStates/course_not_found.png';
import styles from './courseDetail.module.css';
import { showToast } from '../../components/common/toast';

export default function CourseDetail() {

  const { courseId } = useParams();
  const navigate = useNavigate();

  const [showErrorState, setShowErrorState] = useState(false);

  // scroll to top when entering the page or when courseId changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [courseId]);

  const [courseData, setCourseData] = useState({
    title: '',
    category: '',
    description: '',
    rating: 0,
    reviews: 0,
    enrollCount: 0,
    difficulty: '',
    instructor: {},
    durationInfo: { approxHours: 0, weeksToComplete: 0 },
    aboutCourse: '',
    outcomes: [],
    syllabus: []
  });
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [latestSectionId, setLatestSectionId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    if (!courseId) return;

    const fetchPageData = async () => {
      try {
        setIsLoading(true);
        setShowErrorState(false);
        
        const [detailData, syllabusData, enrollData] = await Promise.all([
          getCourseDetail(courseId),
          getSyllabus(courseId).catch((err) => {
            showToast("Failed to load syllabus context, falling back to empty list.", "error")
            return [];
          }),
          getEnrollmentStatus(courseId).catch((err) => {
            showToast("Failed to load enrollment status context, falling back to null.", "error")
            return null;
          })
        ]);

        let parsedOutcomes = [];
        try {
          if (typeof detailData.outcomes === 'string') {
            if (detailData.outcomes.trim().startsWith('[')) {
              parsedOutcomes = JSON.parse(detailData.outcomes);
            } else {
              parsedOutcomes = detailData.outcomes.split(/[\n;]+/).map(i => i.trim()).filter(Boolean);
            }
          } else if (Array.isArray(detailData.outcomes)) {
            parsedOutcomes = detailData.outcomes;
          }
        } catch (e) {
          console.error("Failed to parse outcomes", e);
        }

        const currentCourseData = {
          ...detailData,
          outcomes: parsedOutcomes.length > 0 ? parsedOutcomes : (detailData.outcomes || []),
          syllabus: syllabusData.chapters || syllabusData.syllabus || syllabusData || []
        };

        setCourseData(currentCourseData);
        setIsEnrolled(enrollData ? enrollData.enrolled : false);
        setLatestSectionId(enrollData ? enrollData.latestSectionId : null);

      } catch (err) {
        // Only when 'getCourseDetail' exception or HTTP error will come here
        showToast(err.message || 'Failed to load course details.', "error")
        setShowErrorState(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageData();
  }, [courseId]);

  const handleEnrollClick = async () => {
    try {
      await enrollCourse(courseId);
      setIsEnrolled(true);
      showToast('Successfully enrolled!', 'success');
    } catch (err) {
      showToast(err || 'Enrollment request failed.', 'error');
    }
  };

  const handleContinueLearning = () => {
    const firstLessonId = courseData?.syllabus?.[0]?.sections?.[0]?.id || '';
    const targetLessonId = latestSectionId ? latestSectionId : firstLessonId;

    if (targetLessonId) {
      navigate(`/learning/${courseId}/${targetLessonId}`);
    } else {
      navigate(`/learning/${courseId}`);
    }
  };

  if (showErrorState || !courseData) {
    return (
      <div className={styles.courseDetailContainer}>
        <TopNav />
        <div className={styles.emptyStateContainer}>
          <img src={emptyStateImg} alt="Failed to load course" className={styles.emptyStateImage} />
          <p className={styles.emptyStateText}>Oops! The course information could not be found or failed to load.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.courseDetailContainer} ${isLoading ? styles.loadingState : ''}`}>
      <TopNav />

      <CourseHeader
        courseData={courseData}
        isEnrolled={isEnrolled}
        onEnrollClick={handleEnrollClick}
        onContinueLearning={handleContinueLearning}
      />

      <div className={styles.courseMainContent}>
        <div className={styles.mainLeftColumn}>
          <CourseTabs courseData={courseData} />
        </div>

        <div className={styles.mainRightColumn}>
          <InstructorCard instructorData={courseData.instructor} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
