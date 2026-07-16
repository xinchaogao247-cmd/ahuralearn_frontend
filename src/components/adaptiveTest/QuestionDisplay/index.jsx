import React from 'react';
import styles from './questionDisplay.module.css';

const QuestionDisplay = ({ data, selectedAnswer, onAnswerChange, openAnswer, onOpenAnswerChange }) => {
  if (data.type === 'multiple-choice') {
    return (
      <div className={styles['question-box']}>
        <p className={styles['question-number']}>QUESTION {data.id}</p>
        <h1 className={styles['question-title']}>{data.question}</h1>
        <div className={styles.options}>
          
          
          {data.options.map((opt) => (
  <label
    key={opt.id}
    className={`${styles.option} ${selectedAnswer === opt.text ? styles.checked : ''}`}
    onClick={(e) => {
      e.preventDefault();

      onAnswerChange(
        selectedAnswer === opt.text
          ? null
          : opt.text
      );
    }}
  >
    <input
      type="radio"
      name="answer"
      checked={selectedAnswer === opt.text}
      readOnly
    />
              
              <span className={styles['option-label']}>
                <span className={styles['option-icon']}>✓</span>
                {opt.text}
              </span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (data.type === 'true-false' || data.type === 'short-answer') {
    return (
      <div className={styles['question-box']}>
        {data.type === 'true-false' && (
          <>
            <p className={styles['question-number']}>TRUE / FALSE</p>
            <h1 className={styles['question-title']}>{data.question}</h1>
            <div className={styles.options}>
              {['true', 'false'].map((val) => (
                <label 
                  key={val}
                  className={`${styles.option} ${selectedAnswer === val ? styles.checked : ''}`}
                  onClick={(e) => {
                         e.preventDefault();

                  // 保存真正答案文本，而不是 first/second
                   onAnswerChange(
                       selectedAnswer === val
                        ? null
                        : val
                                 );
              }}
                >
                   <input
                    type="radio"
                    name="tf"
                    checked={selectedAnswer === val}
                    readOnly
                   />
                  <span className={styles['option-label']}>
                    <span className={styles['option-icon']}>✓</span>
                    {val.charAt(0).toUpperCase() + val.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </>
        )}

        {data.type === 'short-answer' && (
          <>
            <p className={styles['question-number']}>SHORT ANSWER</p>
            <h1 className={styles['question-title']}>{data.question}</h1>
            <div className={styles['short-answer']}>
              <textarea
                className={styles['textarea-field']}
                placeholder="Type your answer here..."
                value={openAnswer}
                onChange={(e) => onOpenAnswerChange(e.target.value)}
              />
            </div>
          </>
        )}
      </div>
    );
  }
  return null;
};

export default QuestionDisplay;