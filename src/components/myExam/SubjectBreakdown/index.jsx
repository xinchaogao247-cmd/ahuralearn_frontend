import { useState } from "react";

import styles from "./SubjectBreakdown.module.css";

export default function SubjectBreakdown({ subjects = [] }) {
  const [expanded, setExpanded] = useState(false);
  const visibleSubjects = expanded ? subjects : subjects.slice(0, 3);
  const hasMoreSubjects = subjects.length > 3;

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2>Subject Breakdown</h2>
        <button
          type="button"
          className={styles.iconButton}
          aria-expanded={expanded}
          aria-label={expanded ? "Show fewer subjects" : "Show more subjects"}
          disabled={!hasMoreSubjects}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "Less" : "..."}
        </button>
      </div>

      <div className={`${styles.list} ${expanded ? styles.expandedList : ""}`}>
        {visibleSubjects.length > 0 ? (
          visibleSubjects.map((subject) => (
            <div className={styles.subjectItem} key={subject.id}>
              <div className={styles.subjectTop}>
                <span>{subject.name}</span>
                <strong>{subject.score}%</strong>
              </div>

              <div className={styles.progressTrack}>
                <div
                  className={styles.progressBar}
                  style={{ "--progress-width": `${subject.score}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <h3>No subject data yet</h3>
            <p>Your subject scores will appear after your first completed exam.</p>
          </div>
        )}
      </div>
    </section>
  );
}
