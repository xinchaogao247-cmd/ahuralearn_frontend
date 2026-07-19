import { useState } from "react";
import { Link } from "react-router-dom";

import styles from "./RecentExams.module.css";

const iconMap = {
  code: "</>",
  database: "DB",
  design: "UX",
};

function getExamDetailPath(exam) {
  return `/answerDetails/${exam.id}`;
}

export default function RecentExams({ exams = [] }) {
  const [showAll, setShowAll] = useState(false);
  const visibleExams = showAll ? exams : exams.slice(0, 3);
  const hasMoreExams = exams.length > 3;

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2>Recent Exams History</h2>
        <button
          type="button"
          className={showAll ? styles.activeButton : ""}
          disabled={!hasMoreExams}
          onClick={() => setShowAll((current) => !current)}
        >
          {showAll ? "Show Less" : "View All"}
        </button>
      </div>

      {showAll && (
        <div className={styles.summaryBar}>
          Showing {exams.length} exam records
        </div>
      )}

      <div className={styles.tableHeader}>
        <span>COURSE NAME</span>
        <span>SCORE</span>
        <span>STATUS</span>
      </div>

      <div className={styles.list}>
        {visibleExams.length > 0 ? (
          visibleExams.map((exam) => (
            <Link
              to={getExamDetailPath(exam)}
              className={styles.examRow}
              key={exam.id}
              aria-label={`View exam details for ${exam.courseName}`}
            >
              <div className={styles.courseCell}>
                <span className={styles.examIcon}>
                  {iconMap[exam.icon] ?? "EX"}
                </span>
                <strong>{exam.courseName}</strong>
              </div>

              <strong className={styles.score}>{exam.score}%</strong>

              <span className={styles.status}>{exam.status}</span>
            </Link>
          ))
        ) : (
          <div className={styles.emptyState}>
            <h3>No recent exams yet</h3>
            <p>Completed exams will be listed here with scores and status.</p>
          </div>
        )}
      </div>
    </section>
  );
}
