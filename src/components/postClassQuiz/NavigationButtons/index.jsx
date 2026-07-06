import React from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import styles from './navigationButtons.module.css';

export default function NavigationButtons({ currentIndex, totalQuestions, onPrev, onNext, onFinish, isReviewMode, isRefetching }) {
  
  const isFirst = currentIndex === 0;
  
  const isLast = currentIndex === totalQuestions - 1;

  return (
    <div className={styles.buttonsContainer}>
      {!isFirst ? (
        <button className={styles.secondaryBtn} onClick={onPrev}>
          <ArrowLeft size={18} />
          Previous
        </button>
      ) : <div />}

      {isLast ? (
        <button 
          className={styles.primaryBtn} 
          onClick={onFinish}
          disabled={isReviewMode || isRefetching}
        >
          {isReviewMode ? 'Already Submitted' : 'Finished'}
          {!isReviewMode && <Check size={18} />}
        </button>
      ) : (
        <button className={styles.primaryBtn} onClick={onNext}>
          Next
          <ArrowRight size={18} />
        </button>
      )}
    </div>
  );
}
