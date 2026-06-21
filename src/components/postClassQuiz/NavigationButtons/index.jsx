import React from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import styles from './navigationButtons.module.css';

/**
 * 底部导航按钮组件
 * @param {number} currentIndex 当前题目的索引 (0 开始)
 * @param {number} totalQuestions 题目总数
 * @param {function} onPrev 点击上一题的回调
 * @param {function} onNext 点击下一题的回调
 * @param {function} onFinish 点击完成的回调
 * @param {boolean} isReviewMode 是否复盘模式
 * @param {boolean} isRefetching 是否在提交中
 */
export default function NavigationButtons({ currentIndex, totalQuestions, onPrev, onNext, onFinish, isReviewMode, isRefetching }) {
  // 判断是否是第一题
  const isFirst = currentIndex === 0;
  // 判断是否是最后一题
  const isLast = currentIndex === totalQuestions - 1;

  return (
    <div className={styles.buttonsContainer}>
      {/* 只有不是第一题时，才显示 Previous 按钮 */}
      {!isFirst ? (
        <button className={styles.secondaryBtn} onClick={onPrev}>
          <ArrowLeft size={18} />
          Previous
        </button>
      ) : <div />}

      {/* 如果是最后一题，显示 Finished 按钮，否则显示 Next 按钮 */}
      {isLast ? (
        // onClick 触发完成回调
        <button 
          className={styles.primaryBtn} 
          onClick={onFinish}
          disabled={isReviewMode || isRefetching}
        >
          {isReviewMode ? 'Already Submitted' : 'Finished'}
          {!isReviewMode && <Check size={18} />}
        </button>
      ) : (
        // onClick 触发下一题回调
        <button className={styles.primaryBtn} onClick={onNext}>
          Next
          <ArrowRight size={18} />
        </button>
      )}
    </div>
  );
}
