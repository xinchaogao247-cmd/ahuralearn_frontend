import styles from './questionReview.module.css';

/**
 * 错题回顾组件 (矩阵版)
 * @param {Array} results - 题目结果数组，例如: [{ id: 'q1', isCorrect: true }, { id: 'q2', isCorrect: false }]
 * @param {function} onSelectQuestion - 点击题号跳转的回调函数
 */
const WhyYouMissedIt = ({ results = [], onSelectQuestion }) => {
  // 占位测试数据，如果在 Recommendations 还没传入数据时，可以先看到效果
const displayResults =
    Array.isArray(results)
        ? results
        : [];

  return (
    <div className={styles.card}>
      <div className={styles['section-header']}>
        <div className={`${styles.icon} ${styles['summary-icon']}`}>✓/✗</div>
        <div>
          <h2>Question Review</h2>
          <p>At a glance: Review your correct and incorrect answers. Click on any number to revisit the question.</p>
        </div>
      </div>
      
      <div className={styles['matrix-container']}>
        {displayResults.map((item, index) => (
          <div 
            key={item.id || index} 
            className={`${styles['number-box']} ${item.isCorrect ? styles['box-correct'] : styles['box-incorrect']}`}
            onClick={() => onSelectQuestion && onSelectQuestion(index)}
            title={`Question ${index + 1}: ${item.isCorrect ? 'Correct' : 'Incorrect'}`}
          >
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhyYouMissedIt;
