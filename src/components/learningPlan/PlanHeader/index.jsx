import styles from "./PlanHeader.module.css";

export default function PlanHeader({ activeMode, onModeChange }) {
  return (
    <div className={styles.header}>
      <h2>Study Planner</h2>

      <div className={styles.actions}>
        <button
          className={`${styles.actionBtn} ${
            activeMode === "manual" ? styles.activeManual : styles.manualBtn
          }`}
          type="button"
          onClick={() => onModeChange("manual")}
        >
          Manual Edit
        </button>

        <button
          className={`${styles.actionBtn} ${
            activeMode === "ai" ? styles.activeAi : styles.aiBtn
          }`}
          type="button"
          onClick={() => onModeChange("ai")}
        >
          AI Suggest
        </button>
      </div>
    </div>
  );
}
