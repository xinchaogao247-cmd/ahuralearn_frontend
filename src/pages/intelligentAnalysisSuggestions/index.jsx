import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// 引入公共组件
import TopNav from '../../components/common/TopNav';
import Footer from '../../components/common/Footer';

// 引入业务组件
import AssessmentSummary from '../../components/aiTestDashboard/AssessmentSummary';
import SkillMastery from '../../components/aiTestDashboard/SkillMastery';
import AIChatAssistant from '../../components/intelligentAnalysisSuggestions/AIAdvice';

import styles from './intelligentAnalysisSuggestions.module.css';

import { getDashboardSummary } from '../../api/exam/exam';

export default function IntelligentAnalysisSuggestions() {
// 🌟  定义状态，准备接收 API 数据
  const [skills, setSkills] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  
  // 加载与错误状态控制
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🌟  发起请求，获取用户的能力数据（左侧栏需要用）
  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        setIsLoading(true);
        // 复用接口：获取用户的总分、强弱项和雷达图数据
        const response = await getDashboardSummary();
        const fetchedSkills = response.skills;
        
        // Map DashboardVO to the summary structure expected by AssessmentSummary
        const fetchedSummary = {
          score: response.latestScore || 0,
          maxScore: 100,
          improvement: 0, 
          date: new Date().toLocaleDateString(),
          duration: response.averageTime ? `${Math.round(response.averageTime / 60)}m` : '0m',
          focusArea: fetchedSkills && fetchedSkills.length > 0 ? fetchedSkills[0].name : 'N/A'
        };
        
        setSkills(fetchedSkills);
        setSummaryData(fetchedSummary);
      } catch (err) {
        console.error("获取分析数据失败:", err);
        setError("Failed to load your analysis profile.");
        
        // 兜底数据
        setSkills([
          { name: 'Problem Solving', value: 72, className: 'green' },
          { name: 'Speed', value: 88, className: 'blue' },
          { name: 'Accuracy', value: 64, className: 'orange' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysisData();
  }, []);


  return (
    <div className={styles.page}>
      <div className={styles['header-zone']}>
      <TopNav />
      </div>

      <main className={styles['analysis-page-container']}>
        {/* 顶部返回按钮与标题 */}
        <div className={styles['analysis-page-header']}>
          <Link to="/feedback" className={styles['back-link']}>
            <ArrowLeft size={20} />
            <span>Back to Feedback</span>
          </Link>
          <h1 className={styles['main-title']}>Intelligent analysis suggestions</h1>
        </div>

{/* 🌟  加载状态与错误处理 UI */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#6b7280' }}>
            <h2>Loading your AI analysis profile... 🤖</h2>
          </div>
        ) : error && !summaryData ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#ef4444' }}>
            <h2>{error}</h2>
          </div>
        ) : (
          /* 页面双栏网格布局 */
        <div className={styles['analysis-grid']}>
          
          {/* 左侧栏：窄列 */}
          <div className={styles['analysis-sidebar']}>
            <AssessmentSummary 
              score={summaryData?.score} 
              maxScore={summaryData?.maxScore} 
              improvement={summaryData?.improvement} 
              date={summaryData?.date} 
              duration={summaryData?.duration} 
              focusArea={summaryData?.focusArea}
            />
           {/* 👇 2. 核心修改：增加 layout="vertical" 属性，通知子组件切换为单列垂直排版 */}
            <SkillMastery skills={skills} layout="vertical" />
          </div>

          {/* 右侧栏：宽列 */}
          <div className={styles['analysis-main-content']}>
            {/* 这里是将来的 AI 对话组件，它内部会去调用聊天 POST 接口 */}
            <AIChatAssistant />
          </div>

        </div>
        )}
      </main>

      <div className={styles['footer-zone']}>
        <Footer />
      </div>
    </div>
  );
}