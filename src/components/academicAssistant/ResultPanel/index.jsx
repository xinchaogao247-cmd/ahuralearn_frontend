import React, { useState } from 'react';
import { BarChart3, Info, Activity, TrendingUp } from 'lucide-react';
import styles from './resultPanel.module.css';

const VISIBLE_SOURCES = 2;

/** Structured analysis result: inquiry, definition, explanation, key points, sources. */
export default function ResultPanel({ result }) {
  const [showAllSources, setShowAllSources] = useState(false);
  const sources = result.sources || [];
  const visibleSources = showAllSources ? sources : sources.slice(0, VISIBLE_SOURCES);
  const hiddenCount = sources.length - VISIBLE_SOURCES;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <BarChart3 size={18} color="#2563eb" />
        <h3 className={styles.headerTitle}>Analysis Result</h3>
      </div>

      <div className={styles.inquiry}>
        <div className={styles.inquiryLabel}>YOUR INQUIRY</div>
        <p className={styles.inquiryText}>"{result.inquiry}"</p>
      </div>

      {result.definition && (
        <section className={styles.section}>
          <div className={styles.sectionHead}><Info size={15} color="#2563eb" /><span>Definition</span></div>
          <p className={styles.sectionBody}>{result.definition}</p>
        </section>
      )}

      {result.explanation && (
        <section className={styles.section}>
          <div className={`${styles.sectionHead} ${styles.purple}`}><Activity size={15} color="#7c3aed" /><span>Explanation</span></div>
          <p className={styles.sectionBody} style={{ whiteSpace: 'pre-wrap' }}>{result.explanation}</p>
        </section>
      )}

      {Array.isArray(result.keyPoints) && result.keyPoints.length > 0 && (
        <section className={styles.section}>
          <div className={`${styles.sectionHead} ${styles.green}`}><TrendingUp size={15} color="#059669" /><span>Key Points</span></div>
          <ul className={styles.points}>
            {result.keyPoints.map((kp, i) => (
              <li key={i}><span className={styles.bullet} /><span>{kp}</span></li>
            ))}
          </ul>
        </section>
      )}

      {sources.length > 0 && (
        <div className={styles.sources}>
          <div className={styles.sourcesLabel}>VERIFICATION SOURCES</div>
          <div className={styles.sourceChips}>
            {visibleSources.map((s, i) => (
              s && s.url ? (
                <a key={i} className={styles.chip} href={s.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }} title={s.title}>
                  {s.title}
                </a>
              ) : (
                <span key={i} className={styles.chip}>{s?.title ?? s}</span>
              )
            ))}
            {hiddenCount > 0 && (
              <button type="button" className={`${styles.chip} ${styles.chipToggle}`} onClick={() => setShowAllSources((v) => !v)}>
                {showAllSources ? 'Show less' : `+ ${hiddenCount} more`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
