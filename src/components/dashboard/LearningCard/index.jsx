import DashboardHeader from "../DashboardHeader";
import ProgressRing from "../ProgressRing";
import styles from "./LearningCard.module.css";

export default function LearningCard({ progress }) {
  const percentage = Number(progress?.completedPercent ?? 0);

  return (
    <div className={styles.card}>
      <DashboardHeader title="My Learning Progress" />

      <div className={styles.ringSlot}>
        <ProgressRing percentage={percentage} label="COMPLETED" />
      </div>

      <div className={styles.progressText}>
        <p>{progress?.message}</p>
      </div>
    </div>
  );
}
