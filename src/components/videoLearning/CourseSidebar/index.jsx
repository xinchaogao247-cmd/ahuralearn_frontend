import React, { useState } from 'react';
import { Check, PlayCircle, Unlock, Lock, Play, ChevronDown, ChevronRight } from 'lucide-react';
import styles from './CourseSidebar.module.css';

export default function CourseSidebar({ overallProgress, lessonList, currentLessonId, onSelectLesson }) {
  // To handle multiple chapters being expand/collapse, we can just use a dictionary.
  // Defaults to all chapters expanded.
  const [expandedChapters, setExpandedChapters] = useState({});

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: prev[chapterId] === false ? true : false
    }));
  };

  // Check if a chapter is expanded (default true)
  const isExpanded = (chapterId) => {
    return expandedChapters[chapterId] !== false;
  };

  // Flatten to get total count and completed count
  const allSections = lessonList.reduce((acc, chapter) => {
     return acc.concat(chapter.sections || []);
  }, []);

  const completedCount = allSections.filter(l => l.status === 'completed').length;
  const totalCount = allSections.length;

  return (
    <div className={styles.sidebarContainer}>
      
      <div className={styles.sidebarHeader}>
        <h3 className={styles.headerTitle}>Course Content</h3>
        <div className={styles.progressInfo}>
          <span>{overallProgress}% Completed</span>
          <span>{completedCount} / {totalCount} Lessons</span>
        </div>
        <div className={styles.progressBarContainer}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
      </div>

      <div className={styles.lessonListContainer}>
        {lessonList.map((chapter, chapterIndex) => (
          <div key={chapter.id || chapterIndex} className={styles.chapterBlock}>
            <div 
              className={styles.chapterHeader} 
              onClick={() => toggleChapter(chapter.id || chapterIndex)}
            >
              <div className={styles.chapterHeaderLeft}>
                {isExpanded(chapter.id || chapterIndex) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span className={styles.chapterTitle}>Chapter {chapterIndex + 1}: {chapter.title || 'Untitled'}</span>
              </div>
            </div>

            {isExpanded(chapter.id || chapterIndex) && (
              <div className={styles.chapterSections}>
                {(chapter.sections || []).map((lesson) => {
                  const isNowPlaying = String(lesson.id) === String(currentLessonId);
                  
                  let rowClass = '';
                  let iconElement = null;
                  let showPlayingText = false;

                  if (isNowPlaying) {
                     rowClass = styles.nowPlaying;
                     iconElement = <div className={`${styles.iconWrapper} ${styles.iconNowPlaying}`}><Play size={14} fill="currentColor" /></div>;
                     showPlayingText = true;
                  } else if (lesson.status === 'completed') {
                     rowClass = styles.completed;
                     iconElement = <div className={`${styles.iconWrapper} ${styles.iconCompleted}`}><Check size={16} strokeWidth={3} /></div>;
                  } else if (lesson.status === 'unlocked') {
                     rowClass = styles.unlocked;
                     iconElement = <div className={`${styles.iconWrapper} ${styles.iconUnlocked}`}><PlayCircle size={16} /></div>;
                  } else {
                     rowClass = styles.locked;
                     iconElement = <div className={`${styles.iconWrapper} ${styles.iconLocked}`}><Lock size={14} /></div>;
                  }

                  return (
                    <div 
                      key={lesson.id} 
                      className={`${styles.lessonItem} ${rowClass}`}
                      onClick={() => {
                        if (!isNowPlaying && (lesson.status === 'completed' || lesson.status === 'unlocked')) {
                          onSelectLesson(lesson);
                        }
                      }}
                    >
                      {iconElement}
                      <div className={styles.lessonContent}>
                        <h4 className={`${styles.lessonTitle} ${isNowPlaying ? styles.darkText : (lesson.status === 'locked' ? styles.lightText : '')}`}>
                          {lesson.title || 'Untitled'}
                        </h4>
                        <p className={styles.lessonMeta}>
                          {showPlayingText ? (
                            <span className={styles.nowPlayingText}>Now Playing</span>
                          ) : (
                            lesson.durationStr || lesson.durationFormat || `${lesson.duration || 0} min`
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
