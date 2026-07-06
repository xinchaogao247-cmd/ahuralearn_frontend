import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Menu, PlusSquare, History, Settings, AlertTriangle } from 'lucide-react';
import { fetchHistorySessions } from '../../../api/ai/aiService';
import styles from './sidebar.module.css';

/**
 * 左侧历史会话侧边栏组件
 * @param {boolean} isOpen 侧边栏是否展开
 * @param {function} toggleSidebar 切换侧边栏展开/收起状态的方法
 * @param {number} refreshTrigger 触发重新拉取列表的依赖
 */
export default function Sidebar({ isOpen, toggleSidebar, refreshTrigger }) {
  const navigate = useNavigate();
  const { sessionId: currentSessionId } = useParams();
  const [sessions, setSessions] = useState([]);

  // 组件挂载时或 refreshTrigger 改变时请求历史会话列表
  useEffect(() => {
    const loadSessions = async () => {
      try {
        // 请求后台接口：GET /ai/course/sessions
        // 响应拦截器已解包 Result<T>，返回值直接是 List<ChatSessionVO>
        const data = await fetchHistorySessions();
        setSessions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load history sessions', err);
      }
    };
    loadSessions();
  }, [refreshTrigger]);

  const handleNewChat = () => {
    // 跳转到没有 sessionId 的基础路由，实现"新建对话"
    navigate('/courseRecommendation');
  };

  const handleSelectSession = (sessionId) => {
    // 点击某条历史记录，跳转到对应的对话详情
    navigate(`/courseRecommendation/${sessionId}`);
  };

  return (
    <div className={`${styles.sidebarContainer} ${!isOpen ? styles.sidebarClosed : ''}`}>
      {/* 顶部操作区 */}
      <div className={styles.topActions}>
        <button className={styles.iconButton} onClick={toggleSidebar} title="Toggle sidebar">
          <Menu size={20} />
          <span className={styles.iconText}>Menu</span>
        </button>

        <button
          className={`${styles.iconButton} ${styles.newChatBtn}`}
          onClick={handleNewChat}
          title="New Chat"
        >
          <PlusSquare size={20} />
          <span className={styles.iconText}>New Chat</span>
        </button>

        {/* 历史记录按钮，在收起状态下显示，展开状态下可隐藏或作为头部 */}
        <button className={styles.iconButton} title="History">
          <History size={20} />
          <span className={styles.iconText}>History</span>
        </button>
      </div>

      {/* 历史记录列表区，只有展开时显示 */}
      <div className={styles.historySection}>
        <div className={styles.historyTitle}>Recent</div>
        <div className={styles.historyList}>
          {sessions.length === 0 ? (
            <div className={styles.emptyHint}>
              No conversations yet.
            </div>
          ) : (
            sessions.map(session => {
              const isFailed = session.status === 'failed';
              const isActive = currentSessionId === String(session.sessionId);
              
              return (
                <button
                  key={session.sessionId}
                  className={`${styles.historyItem} ${isActive ? styles.historyItemActive : ''}`}
                  onClick={() => handleSelectSession(session.sessionId)}
                  title={session.title}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {session.title}
                  </span>
                  {isFailed && (
                    <AlertTriangle size={14} color="#ef4444" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 底部设置项 */}
      <div className={styles.bottomActions}>
        <button className={styles.iconButton} title="Settings">
          <Settings size={20} />
          <span className={styles.iconText}>Settings</span>
        </button>
      </div>
    </div>
  );
}
