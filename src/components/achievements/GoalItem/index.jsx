import { Check, Pencil, Trash2 } from "lucide-react";
import ProgressBar from "../ProgressBar";

import styles from "./GoalItem.module.css";

export default function GoalItem({
  goal,
  isCompleteLoading = false,
  onComplete,
  onDelete,
  onEdit,
  onIncrement,
  onToggleComplete,
}) {
  const progress =
    goal.totalValue === 0
      ? 0
      : Math.round((goal.currentValue / goal.totalValue) * 100);
  const isAchieved = goal.achieved === true;
  const showProgress = !isAchieved && progress > 0;

  return (
    <div
      className={`${styles.goalItem} ${showProgress ? styles.active : ""} ${
        progress === 0 ? styles.muted : ""
      }`}
    >
      <button
        className={`${styles.checkBox} ${isAchieved ? styles.achieved : ""}`}
        type="button"
        aria-label={isAchieved ? "Mark goal as incomplete" : "Complete goal"}
        disabled={isCompleteLoading}
        onClick={() => onToggleComplete(goal.id)}
      >
        {isAchieved ? <Check size={16} strokeWidth={3} /> : null}
      </button>

      <div className={styles.goalHeader}>
        <div className={styles.titleRow}>
          <div>
            <h3>{goal.title}</h3>
            <div className={styles.metaRow}>
              <span>{goal.type || "Learning"}</span>
              <span>
                {isAchieved ? `Achieved ${goal.achievedDay}` : `Due ${goal.dueDay}`}
              </span>
              <span>
                {goal.currentValue}/{goal.totalValue}
              </span>
            </div>
          </div>

          <div className={styles.goalActions}>
            {!isAchieved && (
              <button type="button" onClick={() => onIncrement(goal.id)}>
                +1
              </button>
            )}
            <button
              type="button"
              disabled={isCompleteLoading}
              onClick={() => onComplete(goal.id)}
            >
              {isAchieved ? "Completed" : "Complete"}
            </button>
            <button
              type="button"
              aria-label={`Edit ${goal.title}`}
              onClick={() => onEdit(goal)}
            >
              <Pencil size={15} strokeWidth={2.4} />
            </button>
            <button type="button" onClick={() => onDelete(goal)}>
              <Trash2 size={15} strokeWidth={2.4} />
            </button>
          </div>
        </div>

        <div className={styles.progressRow}>
          <ProgressBar progress={progress} />
          <strong>{progress}%</strong>
        </div>
      </div>
    </div>
  );
}
