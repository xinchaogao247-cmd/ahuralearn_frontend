import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { getNewRecommendations } from '../../../api/course/course';
import styles from './NewRecommendations.module.css';
import { showToast } from '../../common/toast';

export default function NewRecommendations() {
  const [courses, setCourses] = useState(Array.from({ length: 4 }).map((_, idx) => ({
    id: `skeleton-initial-${idx}`,
    isPlaceholder: true,
    name: '',
    instructorName: '',
    rating: 0,
    reviewCount: 0
  })));
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const [scrollIndex, setScrollIndex] = useState(0);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await getNewRecommendations();
        setCourses(response);
      } catch (err) {
        showToast('Failed to load new recommendations.', 'error');

        const skeletonData = Array.from({ length: 4 }).map((_, idx) => ({
          id: `skeleton-${idx}`,
          isPlaceholder: true,
          name: '',
          instructorName: '',
          rating: 0,
          reviewCount: 0
        }));
        setCourses(skeletonData);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const scrollLeft = () => {
    setScrollIndex(prev => Math.max(prev - 1, 0));
  };

  const scrollRight = () => {
    const maxScroll = Math.max(courses.length - 4, 0);
    setScrollIndex(prev => Math.min(prev + 1, maxScroll));
  };

  const handleCardClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  return (
    <div className={styles.courseSectionContainer}>
      <h2 className={styles.sectionTitle}>New Course Recommendations</h2>

      {loading && <div className={styles.loadingText}>Loading new recommendations...</div>}

      {!loading && courses.length > 0 && (
        <div className={styles.carouselContainer}>

          {scrollIndex > 0 && (
            <button className={`${styles.arrowButton} ${styles.arrowLeft}`} onClick={scrollLeft}>
              <ChevronLeft size={20} />
            </button>
          )}

          <div className={styles.coursesListWrapper}>
            <div
              className={styles.coursesList}
              style={{ transform: `translateX(calc(-${scrollIndex} * (25% + 0.375rem)))` }}
            >
              {courses.map(course => (
                <div
                  key={course.id}
                  className={styles.courseCard}
                  onClick={() => !course.isPlaceholder && handleCardClick(course.id)}
                  style={course.isPlaceholder ? { pointerEvents: 'none', cursor: 'default' } : {}}
                >
                  {course.isPlaceholder ? (
                    <div className={styles.skeletonImage}></div>
                  ) : (
                    <img src={course.coverUrl} alt={course.name} className={styles.courseImage} />
                  )}
                  <div className={styles.courseInfo}>
                    {course.isPlaceholder ? (
                      <>
                        <div className={`${styles.skeletonText} ${styles.skeletonTitle}`}></div>
                        <div className={`${styles.skeletonText} ${styles.skeletonInstructor}`}></div>
                        <div className={`${styles.skeletonText} ${styles.skeletonRating}`}></div>
                      </>
                    ) : (
                      <>
                        <h3 className={styles.courseTitle}>{course.name}</h3>
                        <p className={styles.instructorName}>{course.instructorName}</p>
                        <div className={styles.ratingWrapper}>
                          <span className={styles.ratingValue}>{course.rating.toFixed(1)}</span>
                          <div className={styles.ratingStarsContainer}>
                            <div className={styles.starsEmpty}>
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star key={`empty-${star}`} size={14} fill="currentColor" />
                              ))}
                            </div>
                            <div
                              className={styles.starsFilled}
                              style={{ width: `${(course.rating / 5) * 100}%` }}
                            >
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star key={`filled-${star}`} size={14} fill="currentColor" />
                              ))}
                            </div>
                          </div>
                          <span className={styles.reviewCount}>
                            ({course.reviewCount.toLocaleString()})
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {scrollIndex < courses.length - 4 && (
            <button className={`${styles.arrowButton} ${styles.arrowRight}`} onClick={scrollRight}>
              <ChevronRight size={20} />
            </button>
          )}

        </div>
      )}
    </div>
  );
}
