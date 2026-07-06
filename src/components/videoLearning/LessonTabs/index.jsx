import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuizOverview } from '../../../api/course/quiz';
import styles from './LessonTabs.module.css';

function QuizOverviewSection({ sectionId, navigate }) {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sectionId) return;
    
    let isMounted = true;
    const fetchOverview = async () => {
      setLoading(true);
      try {
        const res = await getQuizOverview(sectionId);
        if (isMounted) {
            setOverview(res);
        }
      } catch (err) {
        if (isMounted) {
            console.error("Failed to load quiz overview", err);
            setOverview({
                isAttempted: false,
                earnedScore: null,
                totalScore: 50,
                commitTime: null
            });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchOverview();
    
    return () => { isMounted = false; };
  }, [sectionId]);

  if (loading) return <div className={styles.quizOverview}><span className={styles.loadingText}>Loading quiz status...</span></div>;
  if (!overview) return null;

  const handleActionClick = () => {
    navigate(`/quiz/${sectionId}`);
  };

  return (
    <div className={styles.quizOverview}>
      {overview.isAttempted ? (
        <>
          <h3>Post-Class Quiz Record</h3>
          <div className={styles.quizScoreBox}>
            <span className={styles.scoreValue}>{overview.earnedScore} <span className={styles.totalScore}>/ {overview.totalScore}</span></span>
            {overview.commitTime && (
                <span className={styles.submitTime}>Submitted at: {new Date(overview.commitTime).toLocaleString()}</span>
            )}
          </div>
          <button className={styles.quizActionButton} onClick={handleActionClick}>
            View Details
          </button>
        </>
      ) : (
        <>
          <h3>Ready for the Post-Class Quiz?</h3>
          <p>Test your knowledge on this section. (Total scores: {overview.totalScore})</p>
          <button className={styles.quizActionButton} onClick={handleActionClick}>
            Start Quiz
          </button>
        </>
      )}
    </div>
  );
}

export default function LessonTabs({ title, description, sectionId }) {
  const [activeTab, setActiveTab] = useState('Description');
  const navigate = useNavigate();

  const tabs = ['Description', 'Post-class Quiz'];

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <div className={styles.tabsContainer}>
      <div className={styles.tabsHeader}>
        {tabs.map(tab => (
          <button 
            key={tab}
            className={`${styles.tabButton} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => handleTabClick(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'Description' && (
          <div>
            <h2 className={styles.lessonTitle}>{title}</h2>
            <p className={styles.lessonDescription}>
              {description}
            </p>
          </div>
        )}
        
        {activeTab === 'Post-class Quiz' && (
           <QuizOverviewSection sectionId={sectionId} navigate={navigate} />
        )}
      </div>
    </div>
  );
}
