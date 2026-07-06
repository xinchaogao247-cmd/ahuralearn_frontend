import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import styles from './courseCard.module.css';

export default function CourseCard({ course }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/course/${course.id}`);
  };

  const getDifficultyClass = (difficulty) => {
    const level = difficulty?.toUpperCase() || '';
    if (level === 'BEGINNER') return styles.levelBeginner;
    if (level === 'INTERMEDIATE') return styles.levelIntermediate;
    if (level === 'ADVANCED') return styles.levelAdvanced;
    return styles.levelDefault;
  };

  return (
    <div className={styles.cardContainer} onClick={handleCardClick}>
      
      <div className={styles.imageWrapper}>
        <img 
          src={course.coverUrl || course.coverImage} 
          alt={course.name || course.title} 
          className={styles.coverImage}
          loading="lazy"
        />
      </div>

      <div className={styles.infoWrapper}>
        <div className={styles.metaRow}>
          <span className={`${styles.difficultyBadge} ${getDifficultyClass(course.difficultyLevel)}`}>
            {course.difficultyLevel}
          </span>
        </div>

        <h3 className={styles.courseTitle}>{course.name || course.title}</h3>

        <p className={styles.instructorName}>{course.instructorName || course.instructor}</p>

        <div className={styles.ratingRow}>
          <span className={styles.ratingNumber}>{course.rating?.toFixed(1) || '0.0'}</span>
          <div className={styles.starsWrapper}>
            
            <div className={styles.starsEmpty}>
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={`empty-${star}`} size={14} fill="currentColor" />
              ))}
            </div>
            
            <div 
              className={styles.starsFilled} 
              style={{ width: `${((course.rating || 0) / 5) * 100}%` }}
            >
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={`filled-${star}`} size={14} fill="currentColor" />
              ))}
            </div>
          </div>
          <span className={styles.reviewCount}>({(course.reviewCount || course.reviewsCount || 0).toLocaleString()})</span>
        </div>
      </div>
    </div>
  );
}
