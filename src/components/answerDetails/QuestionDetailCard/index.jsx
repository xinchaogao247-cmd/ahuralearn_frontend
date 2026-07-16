import React, { forwardRef } from 'react';
import styles from './questionDetailCard.module.css';

const QuestionDetailCard = forwardRef(
  ({ question, index, userAnswerId, isCorrect }, ref) => {

// 将 optionsJson 转成统一格式
const getOptions = () => {

    if (!question.optionsJson) {
        return [];
    }

    try {

        const parsed = JSON.parse(question.optionsJson);

        // 数据库存的是：
        // ["static","final","const","void"]
        if (
            parsed.length > 0 &&
            typeof parsed[0] === "string"
        ) {

            return parsed.map((text, index) => ({

                id: ["first", "second", "third", "fourth"][index],

                text

            }));

        }

        // 数据库已经是对象格式
        return parsed;

    } catch (e) {

        console.error("optionsJson parse error:", e);

        return [];

    }

};

const options = getOptions();

// 将答案转换成真正显示的文本
const getOptionText = (answer) => {

    if (!answer) {
        return "No Answer";
    }

    // 简答题、判断题直接显示
    if (
        question.type === "short-answer" ||
        question.type === "true-false"
    ) {
        return answer;
    }

    // 没有选项数据时直接返回
    if (!options || options.length === 0) {
        return answer;
    }

    // ===== 新版本 =====
    // 如果数据库已经保存的是答案文本（例如 final、Inheritance）
    // 那么直接返回即可
    const textExists = options.some(opt => opt.text === answer);

    if (textExists) {
        return answer;
    }

    // ===== 兼容旧版本 =====
    // 如果数据库保存的是 first / second / third
    const option = options.find(opt => opt.id === answer);

    if (option) {
        return option.text;
    }

    // 找不到就原样返回
    return answer;
};

    return (
      <div
        ref={ref}
        className={`${styles['detail-card']} ${
          isCorrect
            ? styles['correct-border']
            : styles['incorrect-border']
        }`}
      >

        <div className={styles['card-top']}>

          <span className={styles['q-number']}>
            Question {index + 1}
          </span>

          <span
            className={`${styles['status-badge']} ${
              isCorrect
                ? styles['status-pass']
                : styles['status-fail']
            }`}
          >
            {isCorrect ? "✓ Correct" : "✗ Incorrect"}
          </span>

        </div>

        <h3 className={styles['q-title']}>

          {question.question}

        </h3>

        <div className={styles['answer-comparison']}>

          <div
            className={`${styles['answer-box']} ${styles['user-answer-box']}`}
          >
            <h4>Your Answer</h4>

            <p>

              {getOptionText(userAnswerId)}

            </p>

          </div>

          {question.correctAnswer && (

            <div
              className={`${styles['answer-box']} ${styles['correct-answer-box']}`}
            >

              <h4>Correct Answer</h4>

              <p>

                {getOptionText(question.correctAnswer)}

              </p>

            </div>

          )}

        </div>

        {!isCorrect && (

            <div className={styles['ai-explanation']}>

              <strong>💡 AI Tip：</strong>

              Review the topic

              <strong> {question.topic}</strong>

              and understand why the correct answer is more appropriate.

            </div>

          )}

      </div>
    );
  }
);

export default QuestionDetailCard;