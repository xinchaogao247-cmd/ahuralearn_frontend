import React from 'react';
import { Search, Sparkles } from 'lucide-react';
import styles from './queryCard.module.css';

/**
 * Query input card for the Academic Assistant.
 * Just a prompt box + submit. No "attach file" control — attaching files to the
 * assistant is not implemented, so per the team rule it is left out (not shown broken).
 */
export default function QueryCard({ value, onChange, onSubmit, loading, inputRef }) {
  return (
    <div className={styles.card}>
      <div className={styles.titleRow}>
        <div className={styles.icon}><Search size={18} color="#2563eb" /></div>
        <h2 className={styles.title}>Ask Your Academic Assistant</h2>
      </div>

      <textarea
        ref={inputRef}
        className={styles.textarea}
        rows={5}
        placeholder="Type your research query here, or paste a concept to analyze..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && e.ctrlKey && onSubmit()}
      />

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.submitButton}
          onClick={onSubmit}
          disabled={!value.trim() || loading}
        >
          {loading ? 'Analyzing…' : 'Get Real-time Answer'}
          {!loading && <Sparkles size={15} />}
        </button>
      </div>
    </div>
  );
}
