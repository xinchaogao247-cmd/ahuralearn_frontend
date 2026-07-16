import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TopNav from '../../components/common/TopNav';
import Footer from '../../components/common/Footer';
import styles from './answerDetails.module.css';
import QuestionDetailCard from '../../components/answerDetails/QuestionDetailCard';
import { getAssessmentDetails } from '../../api/exam/exam';


// 🌟 MOCK
const questionBank = [
  {
    id: 12,
    type: 'multiple-choice',
    difficulty: 4,
    topic: 'Supervised Learning',
    question: "In the context of supervised learning, what is the primary purpose of a 'Validation Set' compared to a 'Test Set'?",
    options: [
      { id: 'first', text: "To provide a final evaluation of the model performance." },
      { id: 'second', text: "To tune hyperparameters and prevent overfitting during training." },
      { id: 'third', text: "To increase the size of the training dataset." },
      { id: 'fourth', text: "To label previously unlabelled data points." }
    ],
    correctAnswer: 'second'
  },
  {
    id: 18,
    type: 'true-false',
    difficulty: 5,
    topic: 'Neural Networks',
    question: "Regularization in neural networks is primarily used to increase the model's complexity to better fit the training data.",
    correctAnswer: 'false'
  },
  {
    id: 19,
    type: 'short-answer',
    difficulty: 5,
    topic: 'Overfitting',
    question: "Explain the concept of Overfitting in the context of machine learning and how it affects model performance on unseen data.",
    correctAnswer: null
  }
];




const AnswerDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [examHistory, setExamHistory] = useState({ answers: {}, shortAnswers: {} });
  
  const [questionsList, setQuestionsList] = useState([]);
  const [examMeta, setExamMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 用于保存每个题目 DOM 节点的引用，实现点击跳转时的平滑滚动
  const questionRefs = useRef([]);

  // 🌟  获取 API 数据，彻底告别 localStorage 和手动算分数
  useEffect(() => {

    const fetchDetails = async () => {

        try {

            setIsLoading(true);

            // 从 Feedback 页面获取 assessmentId
            const params = new URLSearchParams(location.search);

            const assessmentId =
                params.get("assessmentId");

            if (!assessmentId) {

                setError("Assessment ID not found.");

                return;
            }

            // request.js 已经返回 result.data
            const report =
                await getAssessmentDetails(assessmentId);

            setQuestionsList(report.details || []);

            setExamMeta({

                score: report.score,

                accuracy: report.accuracyRate,

                totalDuration: report.timeTaken,

                totalQuestions: report.totalQuestions,

                correctCount: report.correctCount

            });

        }
        catch (err) {

            console.error(err);

            setError("Failed to load details.");

        }
        finally {

            setIsLoading(false);

        }

    };

    fetchDetails();

}, [location]);

  // 🌟  等数据加载完毕后，处理跳转锚点的平滑滚动
  useEffect(() => {
    if (questionsList.length > 0) {
      const params = new URLSearchParams(location.search);
      const targetIndex = params.get('qIndex');

      if (targetIndex !== null && questionRefs.current[targetIndex]) {
        setTimeout(() => {
          questionRefs.current[targetIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
          questionRefs.current[targetIndex].classList.add(styles['highlight-flash']);
        }, 100);
      }
    }
  }, [location, questionsList]); // 依赖中加入 questionsList


  // 触发打印功能
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.page}>
      {/* 打印时隐藏导航栏 */}
      <div className={`${styles['header-zone']} ${styles['no-print']}`}>
        <TopNav />
        </div>

      <main className={styles['details-main']}>
        <div className={`${styles['details-header']} ${styles['no-print']}`}>
          <div>
            <button className={styles['back-btn']} onClick={() => navigate(-1)}>← Back to Feedback</button>
            <h1>Detailed Answer Review</h1>
            {/* 🌟 新增：在这里渲染后端传过来的总时间 */}
            {examMeta?.totalDuration && (
              <p style={{ color: '#64748b', fontWeight: '600', marginTop: '0.5rem' }}>
                ⏱️ Total Time Taken: {examMeta.totalDuration}
              </p>
            )}
          </div>
          <button className={styles['print-btn']} onClick={handlePrint}>🖨️ Print Details</button>
        </div>

        {/* 打印专用的头部 */}
        <div className={styles['print-only-header']}>
          <h1>Assessment Report</h1>
          <p>Date: {new Date().toLocaleDateString()}</p>
          {/* 🌟 打印版里也加上总时间 */}
          {examMeta?.totalDuration && <p>Duration: {examMeta.totalDuration}</p>}
        </div>


{/* 🌟 渲染加载/错误状态，或者渲染组件列表 */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#6b7280' }}>
            <h2>Loading question details... 📝</h2>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#ef4444' }}>
            <h2>{error}</h2>
          </div>
        ) : (
          <div className={styles['questions-list']}>
            {/* 🌟 极致清爽的 map 循环！直接把后端现成的数据传给小组件 */}
            {questionsList.map((q, idx) => (
              <QuestionDetailCard
                key={q.questionId}
                question={q}
                index={idx}
                userAnswerId={q.userAnswer}
                isCorrect={q.isCorrect}
                ref={el => questionRefs.current[idx] = el}
              />
          ))}
        </div>
        )}
      </main>

      <div className={`${styles['footer-zone']} ${styles['no-print']}`}>
        <Footer />
        </div>
    </div>
  );
};

export default AnswerDetails;