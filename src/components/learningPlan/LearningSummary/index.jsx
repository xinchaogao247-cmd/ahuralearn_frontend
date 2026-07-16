import DailyProgress from "../DailyProgress";
import styles from "./LearningSummary.module.css";

export default function LearningSummary({ progress }) {
  const percentage = Number(progress?.completedPercent ?? 0);

  return (
    <div className={styles.card}>
      <div className={styles.left}>
        <h1>My Learning Progress</h1>

        <p>{progress?.message}</p>
      </div>

      <DailyProgress percentage={percentage} label="COMPLETED" />
    </div>
  );
}
