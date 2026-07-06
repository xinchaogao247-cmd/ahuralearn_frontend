import React, { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import styles from './inputArea.module.css';

export default function InputArea({ onSend, isLoading }) {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [inputValue]);

  const handleSend = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || isLoading) return;

    onSend(trimmedValue);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.inputContainer}>
      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className={styles.inputWrapper}>
          <textarea
            ref={textareaRef}
            className={styles.inputField}
            placeholder="Ask about courses or follow up on a recommendation"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
          />

          <div className={styles.iconGroup}>
            <button
              className={styles.sendButton}
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              title="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
        <div className={styles.footerNote}>
          Press Enter to send. Press Shift+Enter for a new line.
        </div>
      </div>
    </div>
  );
}
