import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { AlertCircle, Sparkles, User } from 'lucide-react';
import logoImg from '../../../assets/images/logo.png';
import CourseCard from '../CourseCard';
import styles from './chatArea.module.css';

function renderAssistantBlock(block) {
  if (block.type === 'course_card') {
    if (!block.payload || typeof block.payload !== 'object') {
      return null;
    }

    return (
      <div key={block.blockId} className={styles.courseCardBlock}>
        <CourseCard id={block.payload.id} name={block.payload.name} coverUrl={block.payload.coverUrl} difficultyLevel={block.payload.difficultyLevel} />
      </div>
    );
  }

  if (!block.content && block.status !== 'error') {
    return null;
  }

  const isError = block.status === 'error';
  return (
    <div key={block.blockId} className={styles.assistantTextBlock}>
      {isError && (
        <AlertCircle
          size={16}
          style={{
            display: 'inline',
            marginRight: '6px',
            verticalAlign: 'text-bottom',
            color: '#ef4444',
          }}
        />
      )}
      <ReactMarkdown>{block.content}</ReactMarkdown>
    </div>
  );
}

export default function ChatArea({ messages, isLoading }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className={styles.chatContainer}>
        <div className={styles.emptyState}>
          <img src={logoImg} alt="AhuraLearn Logo" className={styles.logoImage} />
          <h2 className={styles.greetingTitle}>AhuraLearn</h2>
          <h3 className={styles.greetingSubTitle}>How can I help you today?</h3>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messageList}>
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          const isAssistant = msg.role === 'assistant';

          return (
            <div
              key={msg.messageId || index}
              className={`${styles.messageRow} ${isUser ? styles.userRow : styles.aiRow}`}
            >
              <div className={`${styles.avatar} ${isUser ? styles.userAvatar : styles.aiAvatar}`}>
                {isUser ? <User size={20} color="#64748b" /> : <Sparkles size={20} />}
              </div>

              <div className={`${styles.messageContent} ${isUser ? styles.userContent : styles.aiContent}`}>
                <div className={styles.senderName}>{isUser ? 'You' : 'AI Assistant'}</div>

                {isUser && <div className={`${styles.bubble} ${styles.userBubble}`}>{msg.content}</div>}

                {isAssistant && (
                  <div className={`${styles.bubble} ${styles.aiBubble} ${styles.assistantBubble}`}>
                    {msg.status === 'streaming' && msg.blocks.length === 1 && !msg.blocks[0].content ? (
                      <div className={styles.loadingBubble}>
                        <div className={styles.dot}></div>
                        <div className={styles.dot}></div>
                        <div className={styles.dot}></div>
                      </div>
                    ) : (
                      <div className={styles.assistantBlocks}>
                        {msg.blocks.map(renderAssistantBlock)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

