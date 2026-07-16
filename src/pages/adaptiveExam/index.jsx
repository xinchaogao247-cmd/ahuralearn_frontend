/* 原examController*/
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './adaptiveExam.module.css';
import TopNav from '../../components/common/TopNav';
import Footer from '../../components/common/Footer';
import QuestionDisplay from '../../components/adaptiveTest/QuestionDisplay';
import AIInsight from '../../components/adaptiveTest/AiInsight'; // 复用之前的AI边栏
import ProgressPanel from '../../components/adaptiveTest/ProgressPanel'; // 引入修改后的进度组件
import { getExamQuestions, submitExam } from '../../api/exam/exam';
import {showToast} from '../../components/common/toast/index';
import Timer from '../../components/adaptiveTest/Timer';


const mockQuestionBank = [
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




const AdaptiveExam = () => {
  const navigate = useNavigate();

  // 从 URL 读取 moduleId，例如 /exam?moduleId=c_001
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get('moduleId') || 'c_001';

  // 用来存放后端返回的题库数据，初始值是空数组
  const [questions, setQuestions] = useState([]); 
  // 用来控制“加载中”的显示，刚进页面时为 true
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);


  const [answers, setAnswers] = useState({}); // 存储所有题目答案
  const [shortAnswers, setShortAnswers] = useState({});


  // 新增1：记录用户到达过的最大进度，解决回退后“历史被截断”的问题
  const [maxReachedIndex, setMaxReachedIndex] = useState(0);
  // 新增2：是否进入作答详情页的开关
  const [isReviewMode, setIsReviewMode] = useState(false);

  // 🌟 计时器相关：定义 timerRef 和存储最终时间的 state
  const timerRef = useRef(null);
  const [finalTimeData, setFinalTimeData] = useState(null);


  // 🌟 新增：组件挂载时，去后端拉取题库
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true); // 开始加载
        // 每次拉取新题目时，清空之前的答案，防止把 Mock 题目和 AI 题目的答案混在一起提交
        setAnswers({});
        setShortAnswers({});
        // 调用获取考题接口，使用 URL 里的 moduleId
        const response = await getExamQuestions(moduleId);        
        // 后端 /api/questions/list 返回数组，request.js 已处理兼容
        setQuestions(response || []);       
      } catch (error) {
        // 🌟 核心修改：请求失败时，静默拦截，并塞入本地 Mock 数据！
       showToast("⚠️ API not found. Using local Mock data fallback!", "warning");
       setQuestions(mockQuestionBank);// 🌟 兜底：请求失败就用 mock 数据
      } finally {
        setIsLoading(false); // 无论成功或失败，结束加载状态
      }
    };
    fetchQuestions();
  }, []); // 空数组表示只在刚进页面时执行一次


// 🌟 加载状态与异常拦截：如果正在加载网络请求，展示 Loading 界面，防止后续计算因空数组而崩溃
  if (isLoading) {
    return (
      <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ color: '#334155' }}>Loading Assessment...</h2>
        <p style={{ color: '#64748b' }}>Generating adaptive test questions for you, please wait...</p>
      </div>
    );
  }

  // 🌟 新增拦截：如果网络请求结束，但是没有拿到数据（防错处理）
  if (!questions || questions.length === 0) {
    return (
      <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2 style={{ color: '#ef4444' }}>⚠️ Failed to fetch assessment questions. Please contact system administrator.</h2>
      </div>
    );
  }


  const currentData = questions[currentIndex];
  const totalQuestions = questions.length; // 假设测试结束的总题数
  // 模拟适应性测试的“历史出题记录”：从题库截取当前题号及以前的所有题目
  // 🚀 修改：历史记录现在基于“到达过的最远题号”截取，而不是当前题号
  const history = questions.slice(0, maxReachedIndex + 1);
  const progress = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  // 处理点击 Next Question / Finish Exam
  const handleNext = () => {
// 🚀 拦截！检查当前题目是否已作答
    const currentId = currentData.id;
    const hasAnswered = 
      (answers[currentId] !== undefined && answers[currentId] !== null) || 
      (shortAnswers[currentId] !== undefined && shortAnswers[currentId].trim() !== '');

    if (!hasAnswered) {
      showToast(' Please answer the current question before moving on to the next one!', 'warning');
      return; // 终止函数，不让它进入下一题
    }

 // 🚀 如果是最后一题，先进入“作答详情页”进行核对
    if (currentIndex === totalQuestions - 1) {
      // 🌟 计时器相关：在进入复查模式、卸载计时器之前，赶紧把数据抓取出来存好！
      if (timerRef.current) {
        setFinalTimeData(timerRef.current.getTimeData());
      }
      setIsReviewMode(true);
      return;
    }

// 🚀 正常进入下一题，并更新最大到达题号
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    if (nextIndex > maxReachedIndex) {
      setMaxReachedIndex(nextIndex);
    }
  };


  // 🌟 修改：交卷逻辑改为真正的异步接口提交
      // 考试结束！计算一个模拟的新成绩并保存到本地
    const handleFinalSubmit = async () => {
    // 组装传给后端的规范化 DTO 数据
    const submitDTO = {
      moduleId: moduleId,           // ← 告知后端本次考试属于哪个模块
      answers: answers || {},
      shortAnswers: shortAnswers || {},
      timeStats: finalTimeData || { totalTimeSeconds: 0, questionTimes: {} }
    };
    
//  🌟 绝对防御：无论网络如何，先强行把作答数据存进浏览器！
// 这样等会跳转到推荐页，那边的 Mock 接口就一定能读到数据并变色。
    localStorage.setItem('examHistory', JSON.stringify(submitDTO));

    try {
          // 提交考试
    const response = await submitExam(submitDTO);

    console.log("submit response =", response);

localStorage.setItem(
    "latestAssessmentId",
    response.assessmentId
);

    console.log(
        "saved assessmentId:",
        localStorage.getItem("latestAssessmentId")
    );

    console.log("✅ submitExam Response:", response);

    // 保存 assessmentId（兼容不同 request.js 返回格式）
    const assessmentId =
      response?.assessmentId ||
      response?.data?.assessmentId;

    if (assessmentId) {
      localStorage.setItem(
        "latestAssessmentId",
        assessmentId
      );
    }     
      // 成功：弹出绿色提示并跳转
      showToast("Exam submitted successfully!", "success");

    // 清除考试计时缓存
      sessionStorage.removeItem('examTotalTime');
      sessionStorage.removeItem('examTimePerQuestion');

      // 跳转反馈页面
      navigate('/feedback');  

    } catch (error) {
      console.error("❌ 后端未连接，启动本地微型判卷模式:", error);
      
      // 失败：弹出黄色警告，并延迟 0.5 秒跳转（让用户看清弹窗）
      showToast("⚠️ API not ready. Generating report locally!", "warning");
      
      setTimeout(() => {
        navigate('/feedback');
      }, 500);
    }
  };



  // ==========================================
  // 渲染区 1：作答详情核对页面 (Review Mode)
  // ==========================================



// 🚀 如果处于核对模式，渲染独立的【作答详情界面】
  if (isReviewMode) {
    return (
      <div className={styles.page}>
        <div className={styles['header-zone']}>
        <TopNav />
        </div>

        <main className={styles['main-grid']} style={{ display: 'block', maxWidth: '800px', margin: '2rem auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Review Your Answers</h2>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
            
            {/* 循环遍历并展示所有题目的用户的答案 */}
            {questions.map((q, idx) => {
              const userAnswer = answers[q.id] || shortAnswers[q.id];
              // 如果是选择题，把选项的 ID 换成具体的文本方便阅读
              let answerText = userAnswer;
              if (q.type === 'multiple-choice') {
                const opt = q.options.find(o => o.id === userAnswer);
                if (opt) answerText = opt.text;
              }

              return (
                <div key={q.id} style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                  <p style={{ fontWeight: '600', color: '#334155', marginBottom: '0.5rem', lineHeight: '1.5' }}>
                    Q{idx + 1}: {q.question}
                  </p>
                  <p style={{ color: '#0b5edd' }}>
                    Your Answer: <span style={{ fontWeight: '700' }}>{answerText || 'Not answered'}</span>
                  </p>
                </div>
              );
            })}

            {/* 详情页的底部按钮 */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
              <button 
                className={styles['hint-link']}
                onClick={() => setIsReviewMode(false)} // 点击退回继续编辑
                style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#64748b' }}
              >
                Go Back & Edit
              </button>
              <button className={styles['cta-button']} onClick={handleFinalSubmit} style={{ padding: '0.75rem 2.5rem' }}>
                Confirm & Submit Test
              </button>
            </div>
          </div>
        </main>
        <div className={styles['footer-zone']}>
        <Footer />
        </div>
      </div>
    );
  }



  // ==========================================
  // 渲染区 2：正常考试页面 (Main Exam Mode)
  // ==========================================



  return (
    <div className={styles.page}>
      <div className={styles['header-zone']}>
      <TopNav />
      </div>
      {/* 这里是主网格，它决定了左右两列布局 */}
      <main className={styles['main-grid']}>

        {/* 左侧：题目主面板 */}
        <section className={styles['panel']}>
          
          {/* 动态进度条 */}
          <div className={styles['progress-row']}>
            <div className={styles['progress-label']}>Question {currentIndex + 1} of {questions.length}</div>
            <div className={styles['progress-value']}>{progress}% Complete</div>
          </div>
          <div className={styles['progress-bar']}><span style={{ width: `${progress}%` }} /></div>
          
          <div className={styles['status-pill']}>AI: Level {currentData.difficulty} Challenge</div>

          {/* 将数据传给 QuestionDisplay 工人组件 */}
          <QuestionDisplay 
            data={currentData}
            selectedAnswer={answers[currentData.id]}
            onAnswerChange={(val) => setAnswers({...answers, [currentData.id]: val})}
            openAnswer={shortAnswers[currentData.id] || ''}
            onOpenAnswerChange={(val) => setShortAnswers({...shortAnswers, [currentData.id]: val})}
          />

<div className={styles['btn-row']}>
            {/* 修改了这里：更新了文字，并用 onClick 替换了原先的 href */}
            <a 
              className={styles['hint-link']} 
              onClick={() => navigate('/aiTestDashboard')} 
              style={{ cursor: 'pointer' }}
            >
              Back to Dashboard
            </a>
            
            <button className={styles['cta-button']} onClick={handleNext}>
              {currentIndex === totalQuestions - 1 ? 'Finish Exam' : 'Next Question'}
            </button>
          </div>
        </section>

{/* ✅ 右侧边栏：将 AIInsight 和 ProgressPanel 垂直排列,还包括Timer */}
        <aside className={styles['panel-secondary']} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* AI Insight 根据当前题目动态变化 */}
        <AIInsight 
          difficultyLevel={currentData.difficulty} 
          topic={currentData.topic} 
          currentIndex={currentIndex} // 👈 把当前题目的索引传给 AI 组件
        />
        
        <ProgressPanel 
            totalQuestions={totalQuestions}
            answers={answers}
            shortAnswers={shortAnswers}
            history={history}
            currentIndex={currentIndex}
            onSelectQuestion={(idx) => setCurrentIndex(idx)} // 允许跳转回以前的题目
            onSubmitQuiz={handleNext} // 触发最后提交
          />

          {/* 🌟 计时器相关：将计时器放在右侧边栏底部，并传入 ref 和当前题目 ID */}
          <Timer 
            ref={timerRef} 
            currentQuestionId={currentData.id} 
          />
          </aside>
         </main>

      <div className={styles['footer-zone']}>   
      <Footer />
      </div>
    </div>
  );
}; // --- 组件函数在这里正确闭合 ---

export default AdaptiveExam;