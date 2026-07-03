import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopNav from '../../components/common/TopNav';
import Sidebar from '../../components/courseRecommendation/Sidebar';
import ChatArea from '../../components/courseRecommendation/ChatArea';
import InputArea from '../../components/courseRecommendation/InputArea';
import { fetchSessionMessages, sendCourseChatStream } from '../../api/ai/aiService';
import { normalizeHistoryMessages } from './messageAdapter';
import { applyCourseCard, applyTextChunk, failRound, finishRound, startRound } from './streamReducer';
import styles from './courseRecommendation.module.css';

export default function CourseRecommendation() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [refreshSidebarTrigger, setRefreshSidebarTrigger] = useState(0);

  const isStreamingRef = useRef(false);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (isStreamingRef.current) {
      return;
    }

    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    isStreamingRef.current = false;
    setIsStreaming(false);
    setIsLoading(false);

    const loadMessages = async () => {
      if (!sessionId) {
        setMessages([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await fetchSessionMessages(sessionId);
        setMessages(Array.isArray(data) ? normalizeHistoryMessages(data) : []);
      } catch (error) {
        console.error('Failed to load messages', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [sessionId]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const endStreaming = (abortController, shouldRefreshSidebar = false) => {
    setIsLoading(false);
    setIsStreaming(false);
    isStreamingRef.current = false;
    if (shouldRefreshSidebar) {
      setRefreshSidebarTrigger((prev) => prev + 1);
    }
    abortController.abort();
  };

  const handleSendMessage = async (userMessage) => {
    if (isStreamingRef.current) {
      return;
    }

    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setMessages((prev) => startRound(prev, userMessage));
    setIsLoading(true);
    setIsStreaming(true);
    isStreamingRef.current = true;

    try {
      await sendCourseChatStream(
        { sessionId: sessionId || null, message: userMessage },
        {
          signal: abortController.signal,
          onSessionId: (newSessionId) => {
            if (!sessionId && newSessionId) {
              navigate(`/courseRecommendation/${newSessionId}`, { replace: true });
            }
          },
          onText: (chunk) => {
            setIsLoading(false);
            setMessages((prev) => applyTextChunk(prev, chunk));
          },
          onCourseCard: (cardPayload) => {
            setIsLoading(false);
            setMessages((prev) => applyCourseCard(prev, cardPayload));
          },
          onErrorEvent: (errPayload) => {
            setMessages((prev) => failRound(prev, errPayload.message || 'An error occurred from AI'));
            // 后端已经进入流内终态，刷新会话列表以同步最近活跃时间和失败会话状态。
            endStreaming(abortController, true);
          },
          onDone: () => {
            setMessages((prev) => finishRound(prev));
            // 后端在 done 前已经完成标题更新和 updateTime 更新，这里刷新侧边栏即可看到最新标题/排序。
            endStreaming(abortController, true);
          },
        }
      );
    } catch (error) {
      if (abortController.signal.aborted) {
        return;
      }

      console.error('Failed to send message', error);
      setMessages((prev) => failRound(prev, "Sorry, I'm having trouble processing your request right now."));
      endStreaming(abortController);
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  };

  const inputLocked = isLoading || isStreaming;

  return (
    <div className={styles.pageWrapper}>
      <TopNav />
      <div className={styles.layoutContainer}>
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          refreshTrigger={refreshSidebarTrigger}
        />

        <div className={styles.mainContent}>
          <ChatArea messages={messages} isLoading={inputLocked} />
          <InputArea onSend={handleSendMessage} isLoading={inputLocked} />
        </div>
      </div>
    </div>
  );
}
