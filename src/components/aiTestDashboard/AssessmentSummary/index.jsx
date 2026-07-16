import {
  useEffect,
  useState
} from 'react';

import styles from './assessmentSummary.module.css';


const AssessmentSummary = ({

  latestScore = 0,

  averageScore = 0,

  accuracyRate = 0,

  averageTime = 0

}) => {

  const [displayScore, setDisplayScore] =
    useState(0);


  useEffect(() => {

    setDisplayScore(0);

    if (latestScore <= 0) {
      return;
    }

    let current = 0;

    const animationDuration = 1000;

    const frameRate = 16;

    const step =
      latestScore /
      (animationDuration / frameRate);


    const timer = setInterval(() => {

      current += step;

      if (current >= latestScore) {

        setDisplayScore(latestScore);

        clearInterval(timer);

      } else {

        setDisplayScore(
          Math.floor(current)
        );

      }

    }, frameRate);


    return () =>
      clearInterval(timer);

  }, [latestScore]);


  const percentage =
    Math.min(
      Math.max(displayScore, 0),
      100
    );


  const formatTime = (seconds) => {

    if (!seconds) {
      return '0 sec';
    }

    if (seconds < 60) {

      return `${Math.round(seconds)} sec`;

    }

    const minutes =
      Math.floor(seconds / 60);

    const remainingSeconds =
      Math.round(seconds % 60);

    return `${minutes}m ${remainingSeconds}s`;

  };


  return (

    <div className={styles.card}>

      <h4 className={styles['summary-title']}>

        Assessment Summary

      </h4>


      <div className={styles['score-display']}>

        <div className={styles['score-number']}>

          <span className={styles.score}>

            {displayScore}

          </span>

          <span className={styles['score-max']}>

            /100

          </span>

        </div>


        <div style={{ flex: 1 }}>

          <div
            className={
              styles['summary-progress-bg']
            }
          >

            <div

              className={
                styles['progress-bar-fill']
              }

              style={{
                width: `${percentage}%`
              }}

            />

          </div>

        </div>

      </div>


      <div className={styles['summary-details']}>

        <div className={styles['detail-item']}>

          <span className={styles['detail-label']}>

            Average Score

          </span>

          <span className={styles['detail-value']}>

            {averageScore.toFixed(1)}

          </span>

        </div>


        <div className={styles['detail-item']}>

          <span className={styles['detail-label']}>

            Accuracy

          </span>

          <span className={styles['detail-value']}>

            {accuracyRate.toFixed(1)}%

          </span>

        </div>


        <div className={styles['detail-item']}>

          <span className={styles['detail-label']}>

            Average Time

          </span>

          <span
            className={`${styles['detail-value']} ${styles['focus-area']}`}
          >

            {formatTime(averageTime)}

          </span>

        </div>

      </div>

    </div>

  );

};

export default AssessmentSummary;