import React from 'react';
import { Bookmark, CheckCircle2, CheckCircle, XCircle, Check, X } from 'lucide-react';
import styles from './questionCard.module.css';

/**
 * 左侧题目展示区组件
 * @param {object} question 当前的问题对象数据
 * @param {number} currentIndex 当前的题目索引
 * @param {object} currentAnswer 用户针对当前题目的作答情况数据组合
 * @param {boolean} isReviewMode 是否是复盘模式
 * @param {function} onOptionSelect 选择选项的回调函数
 * @param {function} onToggleFlag 切换标记重看的回调函数
 * @param {React.ReactNode} children 插入底部的导航按钮
 */
export default function QuestionCard({ question, currentIndex, currentAnswer, isReviewMode, onOptionSelect, onToggleFlag, children }) {
  if (!question) return null;

  const isFlagged = currentAnswer?.isFlagged || false;
  // In review mode, show the user's recorded answer. Otherwise rely on local dynamic state.
  const selectedOption = isReviewMode ? question.userAnswer : (currentAnswer?.selectedOption || null);

  return (
    <div className={styles.cardContainer}>
      {/* 头部信息：显示“Question N”和情况 */}
      <div className={styles.cardHeader}>
        <div className={styles.questionBadgeGroup}>
          <div className={styles.questionBadge}>
            QUESTION {currentIndex + 1}
          </div>
          <span className={styles.questionScore}>({question.score} pts)</span>
          {isReviewMode && (
            <span className={`${styles.statusBadge} ${question.isCorrect ? styles.statusCorrect : styles.statusWrong}`}>
              {question.isCorrect ? <CheckCircle size={16} /> : <XCircle size={16} />}
              {question.isCorrect ? 'Correct' : 'Incorrect'}
            </span>
          )}
        </div>
        
        {!isReviewMode && onToggleFlag && (
          <button 
            className={`${styles.bookmarkButton} ${isFlagged ? styles.bookmarkActive : ''}`}
            onClick={() => onToggleFlag(question.questionId)}
            title="Bookmark this question"
          >
            <Bookmark size={24} fill={isFlagged ? "currentColor" : "none"} />
          </button>
        )}
      </div>

      {/* 题目内容 */}
      <h2 className={styles.questionTitle}>
        {question.content || question.title}
      </h2>

      {/* 选项列表 */}
      <div className={styles.optionsList}>
        {Object.entries(question.options || {}).map(([key, value]) => {
          const isSelected = selectedOption === key;
          const isCorrectAnswer = isReviewMode && question.correctAnswer === key;
          const isWrongSelection = isReviewMode && isSelected && !question.isCorrect;

          let optionStyle = styles.optionItem;
          if (isReviewMode) {
              if (isCorrectAnswer) optionStyle += ` ${styles.optionCorrect}`;
              else if (isWrongSelection) optionStyle += ` ${styles.optionWrong}`;
              else optionStyle += ` ${styles.optionDisabled}`;
          } else {
              if (isSelected) optionStyle += ` ${styles.optionSelected}`;
          }

          return (
            <button 
              key={key} 
              className={optionStyle}
              onClick={() => !isReviewMode && onOptionSelect(question.questionId, key)}
              disabled={isReviewMode}
            >
              <div className={styles.radioVirtual}>
                <div className={styles.radioVirtualInner}></div>
              </div>
              
              <div className={styles.optionContent}>
                <span className={styles.optionKeyLabel}>{key}</span>
                <span className={styles.optionText}>{value}</span>
              </div>
              
              {isReviewMode && isCorrectAnswer && <Check className={styles.correctIcon} size={20} />}
              {isReviewMode && isWrongSelection && <X className={styles.wrongIcon} size={20} />}
              {!isReviewMode && isSelected && <CheckCircle2 className={styles.selectedIcon} size={20} />}
            </button>
          )
        })}
      </div>

      {/* 底部导航区域 */}
      <div className={styles.footerActions}>
        {children}
      </div>
    </div>
  );
}
