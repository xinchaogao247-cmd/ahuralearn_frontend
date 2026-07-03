import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './courseCard.module.css';

const DEFAULT_LEVEL = 'beginner';

const LEVEL_STYLES = {
  beginner: {
    label: 'Beginner',
    backgroundColor: '#d1fae5',
    color: '#059669',
  },
  intermediate: {
    label: 'Intermediate',
    backgroundColor: '#e0e7ff',
    color: '#4338ca',
  },
  advanced: {
    label: 'Advanced',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
  },
};

function resolveDifficultyLevel(level) {
  const normalizedLevel = typeof level === 'string' ? level.trim().toLowerCase() : '';
  return LEVEL_STYLES[normalizedLevel] || LEVEL_STYLES[DEFAULT_LEVEL];
}

/**
 * AI 推荐的单张课程卡片组件
 * @param {string} id 课程ID
 * @param {string} name 课程名称
 * @param {string} coverUrl 课程封面
 * @param {string} difficultyLevel 课程难度
 */
export default function CourseCard({ id, name, coverUrl, difficultyLevel }) {
  const navigate = useNavigate();
  const level = resolveDifficultyLevel(difficultyLevel);

  const handleCardClick = () => {
    if (id) {
      navigate(`/course/${id}`);
    }
  };

  return (
    <div className={styles.cardContainer} style={{ cursor: 'pointer' }}>
      <div className={styles.imageWrapper}>
        <img
          src={coverUrl || 'https://ahuralearn.oss-ap-southeast-3.aliyuncs.com/course/coverImage/deafult_coverPage.jpeg'}
          alt="cover"
          className={styles.courseImage}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://ahuralearn.oss-ap-southeast-3.aliyuncs.com/course/coverImage/deafult_coverPage.jpeg';
          }}
        />
      </div>

      <div className={styles.cardContent}>
        <div className={styles.headerRow}>
          <h4 className={styles.title}>{name}</h4>
          <span
            className={styles.levelBadge}
            style={{
              backgroundColor: level.backgroundColor,
              color: level.color,
            }}
          >
            {level.label}
          </span>
        </div>

        <div className={styles.footerRow} onClick={handleCardClick} style={{ marginTop: 'auto' }}>
          <button className={styles.viewButton}>View Course</button>
        </div>
      </div>
    </div>
  );
}
