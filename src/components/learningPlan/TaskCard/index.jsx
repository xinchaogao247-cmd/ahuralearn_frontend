import styles from "./TaskCard.module.css";

const cx = (...names) => names.map((name) => styles[name]).filter(Boolean).join(" ");

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

function formatPriority(priority) {
  const normalizedPriority = priority?.toLowerCase() ?? "medium";

  return `${normalizedPriority.charAt(0).toUpperCase()}${normalizedPriority.slice(1)}`;
}

function formatStudyTime(studyTime) {
  if (studyTime === undefined || studyTime === null || studyTime === "") {
    return "";
  }

  const value = String(studyTime).trim();

  if (/\s*(h|m)$/i.test(value)) {
    return value;
  }

  if (Number(value) === 0.5) {
    return "30m";
  }

  return `${value}h`;
}

function getDueLabel(task) {
  if (task.completed) {
    return "Finished";
  }

  if (task.dueText) {
    return task.dueText;
  }

  const today = toDateKey(new Date());
  const tomorrow = toDateKey(addDays(new Date(), 1));

  if (task.dueDate === today) {
    return "Due Today";
  }

  if (task.dueDate === tomorrow) {
    return "Tomorrow";
  }

  if (task.dueDate < today) {
    return "Overdue";
  }

  return "This Week";
}

function normalizePlanText(text) {
  return String(text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\u99C3\u657C|\u9241\u533D?|\u9241/g, "- ")
    .replace(/(?:\uD83D\uDD39|\u2705|\u2022)\s*/g, "- ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function TaskCard({
  isCompleteLoading = false,
  task,
  onDelete,
  onEdit,
  onToggleComplete,
}) {
  const isDone = task.completed === true;
  const priorityLabel = formatPriority(task.priority);
  const priorityClass = `priority${priorityLabel}`;
  const dueLabel = getDueLabel(task);
  const isActive = dueLabel === "Due Today" && !isDone;
  const isAiTask =
    task.source === "AI" ||
    task.aiGenerated === true ||
    task.subtitle === "AI Generated";
  const sourceLabel = isDone ? "Completed 2h ago" : "Manual Entry";
  const taskTitle = normalizePlanText(task.title);
  const taskNote = normalizePlanText(
    task.note || (task.subtitle === "AI Generated" ? "" : task.subtitle)
  );

  return (
    <div className={cx("taskItem", isActive && "active", isDone && "finished")}>
      <div className={styles.taskLeft}>
        <button
          className={cx("taskCheck", isDone && "done")}
          type="button"
          aria-label={isDone ? "Mark task as incomplete" : "Mark task as complete"}
          disabled={isCompleteLoading}
          onClick={() => onToggleComplete(task.id)}
        ></button>

        <div>
          <h3>{taskTitle}</h3>

          {isAiTask ? (
            <>
              <div className={styles.taskTags}>
                <span className={styles["ai-tag"]}>AI SUGGESTION</span>
                <span className={styles["priority-tag"]}>Priority {priorityLabel}</span>
              </div>
              {taskNote && <p>{taskNote}</p>}
            </>
          ) : (
            <>
              <div className={styles.manualMeta}>
                <span>{sourceLabel}</span>
                <span>{formatStudyTime(task.studyTime ?? task.studyTimeHours)}</span>
                <span className={styles[priorityClass]}>
                  {priorityLabel} Priority
                </span>
              </div>

              {taskNote && <p>{taskNote}</p>}
            </>
          )}
        </div>
      </div>

      <div className={styles.taskRight}>
        <span className={isActive ? styles.dueText : styles.taskGray}>
          {dueLabel}
        </span>

        <div className={styles.taskActions}>
          <button
            type="button"
            disabled={isCompleteLoading}
            onClick={() => onToggleComplete(task.id)}
          >
            {isDone ? "Completed" : "Complete"}
          </button>
          <button type="button" onClick={() => onEdit(task)}>
            Edit
          </button>
          <button type="button" onClick={() => onDelete(task)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
