import React from 'react';
import { Bookmark, CheckCircle2, CheckCircle, XCircle, Check, X } from 'lucide-react';
import styles from './questionCard.module.css';

export default function QuestionCard({ question, currentIndex, currentAnswer, isReviewMode, onOptionSelect, onToggleFlag, children }) {
  if (!question) return null;

  const isFlagged = currentAnswer?.isFlagged || false;
  // In review mode, show the user's recorded answer. Otherwise rely on local dynamic state.
  const selectedOption = isReviewMode ? question.userAnswer : (currentAnswer?.selectedOption || null);

  return (
    <div className={styles.cardContainer}>
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

      <h2 className={styles.questionTitle}>
        {question.content || question.title}
      </h2>

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

      <div className={styles.footerActions}>
        {children}
      </div>
    </div>
  );
}
