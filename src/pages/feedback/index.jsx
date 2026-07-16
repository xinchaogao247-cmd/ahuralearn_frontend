import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

import TopNav from '../../components/common/TopNav';
import Footer from '../../components/common/Footer';
import ProgressOverview from '../../components/feedback/ProgressOverview';
import WhyYouMissedIt from '../../components/feedback/QuestionReview';
import AiAdviceCard from '../../components/feedback/AiAdviceCard';
import PracticeNext from '../../components/feedback/PracticeNext';
import styles from './feedback.module.css';

import { getAssessmentReport, getAssessmentHistory } from '../../api/exam/exam';







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









const Feedback = () => {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState(null);
  
  // 新增：加载与错误状态控制
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 新增：历史记录状态
  const [historyList, setHistoryList] = useState([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(
    localStorage.getItem("latestAssessmentId") || ""
  );

// 新增：用于存储动态计算出的概览数据
  const [overviewStats, setOverviewStats] = useState({
    score: 0,
    focusArea: 'General',
    strength: 'N/A',
    weakness: 'N/A'
  });


  useEffect(() => {
    // 拉取历史记录
    const fetchHistory = async () => {
      try {
        const historyData = await getAssessmentHistory();
        setHistoryList(historyData || []);
      } catch (err) {
        console.error("Failed to fetch assessment history", err);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
// 🌟 3. 发起异步 API 请求
    const fetchReportData = async () => {
      try {
        setIsLoading(true);
        // 调用接口获取最新报告（后端或者我们 mock 的 promise 已经帮忙算好了一切）
        const assessmentId = selectedAssessmentId;

        console.log(
    "Feedback assessmentId =",
    assessmentId
);
       
        if (!assessmentId) {
    setError("No assessment record found.");
    setIsLoading(false);
    return;
}
        
        const response = await getAssessmentReport(assessmentId);
        
        // 从返回的数据中解构出需要的部分
        const report = response?.data || response;
        const details = report?.details || [];

setOverviewStats({

    score: report.score,

    focusArea:
        details.find(item => !item.isCorrect)?.topic || "Excellent",

    strength:
        details.find(item => item.isCorrect)?.topic || "N/A",

    weakness:
        details.find(item => !item.isCorrect)?.topic || "None"

});

setTestResults(details);
        


      } catch (err) {
        console.error("获取评估报告失败:", err);
        setError("Failed to load assessment report.");
        
        // 兜底数据，防止页面崩溃
        setOverviewStats({ score: 0, focusArea: 'N/A', strength: 'N/A', weakness: 'N/A' });
        setTestResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [selectedAssessmentId]);


const handleQuestionClick = (questionIndex) => {

    const assessmentId = selectedAssessmentId;

    navigate(
        `/answerDetails?assessmentId=${assessmentId}&qIndex=${questionIndex}`
    );

};

  return (
    <div className={styles.page}>
      <div className={styles['header-zone']}>
      <TopNav />
      </div>

{/* 使用规范的主内容区容器 */}
      <main className={styles.container}>

{/* 新增：将标题段落和 ProgressOverview 放在同一个 hero 容器中，保持原有间距 */}
{/* 🌟 优雅的加载与错误处理 UI */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#6b7280' }}>
            <h2>Generating your personalized report... 📊</h2>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#ef4444' }}>
            <h2>{error}</h2>
          </div>
        ) : (
          <>

<section className={styles.hero}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h1 className={styles['hero-title']}>
              AI Assessment & Feedback
            </h1>
            {historyList.length > 0 && (
              <select 
                value={selectedAssessmentId} 
                onChange={(e) => {
                  setSelectedAssessmentId(e.target.value);
                  localStorage.setItem("latestAssessmentId", e.target.value);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  fontSize: '1rem',
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                {historyList.map(item => (
                  <option key={item.id} value={item.id}>
                    Score: {item.score} | Date: {new Date(item.createTime).toLocaleDateString()}
                  </option>
                ))}
              </select>
            )}
          </div>
          <p className={styles['hero-desc']}>
            We've analyzed your performance to identify core concepts that need more attention. Here is your personalized roadmap to mastery.
          </p>
        </div>

{/* 将动态计算的数据传递给 ProgressOverview */}
<ProgressOverview 
        score={overviewStats.score}
        focusArea={overviewStats.focusArea}
        strength={overviewStats.strength}
        weakness={overviewStats.weakness}
      />
</section>

      <div className={styles['main-grid']}>
        <div className={styles['left-column']}>
          {/* 将数据和回调传给组件 */}
          <WhyYouMissedIt 
            results={testResults || []} 
            onSelectQuestion={handleQuestionClick} 
          />

          <AiAdviceCard />
        </div>

{/* 右侧栏 */}
        <div className={styles['right-column']} >
          <PracticeNext />

 {/* 新增：放在 PracticeNext 下方的跳转字段 */}
<div className={styles['back-dashboard-wrapper']}>
            <Link to="/aiTestDashboard" className={styles['back-link']}>
              <ArrowLeft size={16} />
              <span>Back Adaptive Assessment Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
     </>
    )}
      </main>

      <div className={styles['footer-zone']}>
      <Footer />
      </div>
    </div>
  );
};

export default Feedback;
