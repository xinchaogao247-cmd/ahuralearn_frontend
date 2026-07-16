import { Trash2, X } from "lucide-react";

import dataIcon from "../../../assets/icons/datascience.png";
import designIcon from "../../../assets/icons/design.png";
import devIcon from "../../../assets/icons/development.png";
import goalImg from "../../../assets/icons/goal.png";
import styles from "./CourseStats.module.css";

const categoryMeta = {
  DEVELOPMENT: {
    title: "Development",
    icon: devIcon,
  },
  DESIGN: {
    title: "Design",
    icon: designIcon,
  },
  DATA_SCIENCE: {
    title: "Data Science",
    icon: dataIcon,
  },
};

const categoryIcons = {
  code: devIcon,
  development: devIcon,
  design: designIcon,
  data_science: dataIcon,
};

export default function CourseStats({
  categories,
  goal,
  goals,
  goalToDelete,
  onRequestDeleteGoal,
  onCancelDeleteGoal,
  onConfirmDeleteGoal,
}) {
  const fallbackGoals = goal
    ? [
        {
          id: "course-page-goal",
          title: `Finish ${goal.targetLessons} lessons`,
          current: goal.completedLessons,
          total: goal.targetLessons,
        },
      ]
    : [];
  const displayedGoals = goals.length > 0 ? goals : fallbackGoals;
  const displayedCategories = [...(categories ?? [])]
    .sort((a, b) => Number(b.count ?? 0) - Number(a.count ?? 0))
    .slice(0, 3);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarCard}>
        <h3>Course Categories</h3>

        {displayedCategories.map((category) => {
          const meta = categoryMeta[category.category] ?? {
            title: category.name ?? category.category,
            icon: categoryIcons[String(category.icon ?? "").toLowerCase()] ?? devIcon,
          };
          const categoryKey = category.name ?? category.category;

          return (
            <div key={categoryKey} className={styles.categoryItem}>
              <img src={meta.icon} alt="" className={styles.categoryIcon} />
              <span>{meta.title}</span>
              <span>{category.count}</span>
            </div>
          );
        })}
      </div>

      <div className={styles.weeklyGoalsPanel}>
        {displayedGoals.map((weeklyGoal) => {
          const currentValue = weeklyGoal.currentValue ?? weeklyGoal.current ?? 0;
          const totalValue = weeklyGoal.totalValue ?? weeklyGoal.total ?? 0;
          const progress =
            totalValue > 0
              ? Math.round((currentValue / totalValue) * 100)
              : 0;

          return (
            <div key={weeklyGoal.id} className={styles.goalCard}>
              <div className={styles.goalTop}>
                <img src={goalImg} alt="" className={styles.goalImage} />
                <p className={styles.goalLabel}>WEEKLY GOAL</p>
                <button
                  type="button"
                  className={styles.deleteButton}
                  aria-label={`Delete ${weeklyGoal.title}`}
                  onClick={() => onRequestDeleteGoal(weeklyGoal)}
                >
                  <Trash2 size={15} strokeWidth={2.3} />
                </button>
              </div>

              <h4>{weeklyGoal.title}</h4>

              <div className={styles.goalLine}>
                <div
                  className={styles.goalFill}
                  style={{ "--goal-progress": `${progress}%` }}
                />
              </div>

              <span>
                {currentValue}/{totalValue}
              </span>
            </div>
          );
        })}
      </div>

      {goalToDelete && (
        <div className={styles.dialogBackdrop} role="presentation">
          <div
            className={styles.confirmDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-goal-title"
          >
            <button
              type="button"
              className={styles.dialogClose}
              aria-label="Close delete confirmation"
              onClick={onCancelDeleteGoal}
            >
              <X size={17} strokeWidth={2.4} />
            </button>

            <div className={styles.dialogIcon}>
              <Trash2 size={22} strokeWidth={2.4} />
            </div>

            <h3 id="delete-goal-title">Delete weekly goal?</h3>
            <p>
              This will remove "{goalToDelete.title}" from your weekly goals.
            </p>

            <div className={styles.dialogActions}>
              <button type="button" onClick={onCancelDeleteGoal}>
                Cancel
              </button>
              <button type="button" onClick={onConfirmDeleteGoal}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
