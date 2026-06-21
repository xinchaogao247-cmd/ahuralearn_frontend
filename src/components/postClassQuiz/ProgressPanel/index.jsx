import React from 'react';
import styles from './progressPanel.module.css';

/**
 * 右侧答题进度板组件
 * @param {Array} questions 题目总数组
 * @param {Array} answers 用户的回答数组数据
 * @param {number} currentIndex 当前正在看哪一题 (0 开始)
 * @param {boolean} isReviewMode 是否处于复盘模式
 * @param {function} onSelectQuestion 用户点击题号，跳转到该题的回调
 * @param {function} onSubmitQuiz 点击下方 Submit Quiz 按钮
 */
export default function ProgressPanel({ questions, answers, currentIndex, isReviewMode, onSelectQuestion, onSubmitQuiz }) {
  const total = questions.length;
  // If review mode, we count all mapped answers (which usually match the total)
  const answeredCount = answers.filter(a => a.selectedOption).length;
  const progressPercent = total === 0 ? 0 : Math.round((answeredCount / total) * 100);

  return (
    <div className={styles.panelContainer}>
      <div className={styles.header}>
        <span className={styles.title}>{isReviewMode ? 'Review Progress' : 'Progress'}</span>
        {!isReviewMode && <span className={styles.percentage}>{progressPercent}%</span>}
      </div>

      {!isReviewMode && (
        <>
          <div className={styles.progressBarTrack}>
            <div 
              className={styles.progressBarFill} 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className={styles.questionsCount}>
            {answeredCount} / {total} Questions
          </div>
        </>
      )}

      {isReviewMode && (
        <div className={styles.reviewSummary}>
          <p>You are viewing your previous submission.</p>
        </div>
      )}

      <div className={styles.matrixContainer}>
        {questions.map((q, idx) => {
          const answerData = answers.find(a => a.questionId === q.questionId);
          const isAnswered = !!answerData?.selectedOption;
          const isFlagged = !!answerData?.isFlagged;
          const isActive = idx === currentIndex;

          let boxClass = `${styles.numberBox}`;
          if (isActive) boxClass += ` ${styles.boxActive}`;
          
          if (isReviewMode) {
              boxClass += q.isCorrect ? ` ${styles.boxCorrect}` : ` ${styles.boxWrong}`;
          } else if (isAnswered && !isActive) {
              boxClass += ` ${styles.boxAnswered}`;
          }

          return (
            <div 
              key={q.questionId} 
              className={boxClass}
              onClick={() => onSelectQuestion(idx)}
            >
              {idx + 1}
              
              {!isReviewMode && isFlagged && (
                <span className={styles.flagIcon} title="Flagged">
                  🚩
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div className={styles.submitAction}>
        <button 
          className={styles.submitButton} 
          onClick={onSubmitQuiz}
          disabled={isReviewMode}>
          {isReviewMode ? 'Finished' : 'Submit Quiz'}
        </button>
      </div>
    </div>
  );
}
