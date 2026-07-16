import AchievementStats from "../AchievementStats";
import ProgressBar from "../ProgressBar";
import TrophyCard from "../TrophyCard";
import styles from "./AchievementSummary.module.css";

export default function AchievementSummary({ summary }) {
  const certificationName = summary.certificationName ?? "No Certificate In Progress";
  const certificationProgress = summary.certificationProgress ?? 0;
  const stats = [
    {
      label: "TOTAL ACHIEVEMENTS",
      value: summary.totalAchievements,
    },
    {
      label: "CERTIFICATES EARNED",
      value: summary.certificatesEarned,
    },
  ];

  return (
    <section className={styles.summaryCard}>
      <div className={styles.summaryContent}>
        <div className={styles.summaryLeft}>
          <h1>My Achievements Summary</h1>
          <p className={styles.lead}>
            Your learning journey is reaching new heights. Keep up the momentum!
          </p>

          <AchievementStats stats={stats} />

          <div className={styles.milestoneRow}>
            <p>
              Next Certificate: <span>{certificationName}</span>{" "}
              In Progress
            </p>
            <strong>{certificationProgress}%</strong>
          </div>

          <ProgressBar progress={certificationProgress} variant="summary" />
        </div>

        <TrophyCard certificationName={certificationName} />
      </div>
    </section>
  );
}
