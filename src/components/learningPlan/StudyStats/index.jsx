import { useState } from "react";
import { Trash2, X } from "lucide-react";

import { showToast } from "../../common/toast";
import PlanHeader from "../PlanHeader";
import TaskCard from "../TaskCard";
import styles from "./StudyStats.module.css";

const emptyManualPlan = {
  title: "",
  subtitle: "",
  dueOption: "This Week",
  studyTimeHours: 1,
  priority: "MEDIUM",
  note: "",
};

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

function getDueOptionFromDate(dueDate) {
  const today = toDateKey(new Date());
  const tomorrow = toDateKey(addDays(new Date(), 1));

  if (dueDate === today) {
    return "Due Today";
  }

  if (dueDate === tomorrow) {
    return "Tomorrow";
  }

  return "This Week";
}

function getStudyTimeValue(studyTime) {
  const value = String(studyTime ?? "").trim().toLowerCase();

  if (value.endsWith("m")) {
    return Number.parseFloat(value) / 60 || 1;
  }

  return Number.parseFloat(value) || 1;
}

function formatStudyTimeValue(hours) {
  return hours === 0.5 ? "30m" : `${hours}h`;
}

function isAIStudyPlan(task) {
  return (
    task.source === "AI" ||
    task.aiGenerated === true ||
    task.subtitle === "AI Generated"
  );
}

export default function StudyStats({
  loadingPlanId,
  planner,
  onComplete,
  onCreate,
  onDelete,
  onPageChange,
  onUpdate,
  pagination,
}) {
  const [mode, setMode] = useState("none");
  const [manualPlan, setManualPlan] = useState(emptyManualPlan);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const visibleTasks =
    mode === "ai"
      ? planner.tasks.filter(isAIStudyPlan)
      : planner.tasks;
  const totalPages = Math.max(1, pagination.pages);
  const activePage = Math.min(pagination.pageNum, totalPages);
  const pageRangeStart = pagination.total === 0
    ? 0
    : (activePage - 1) * pagination.pageSize + 1;
  const pageRangeEnd = Math.min(
    pageRangeStart + planner.tasks.length - 1,
    pagination.total
  );
  const shouldShowPagination = pagination.total > pagination.pageSize;

  const handleToggleComplete = async (taskId) => {
    if (onComplete) {
      await onComplete(taskId);
      return;
    }

  };

  const updateManualPlan = (field, value) => {
    setManualPlan((currentPlan) => ({
      ...currentPlan,
      [field]: value,
    }));
  };

  const resetManualPlan = () => {
    setManualPlan(emptyManualPlan);
    setEditingTaskId(null);
  };

  const handleEditTask = (task) => {
    // GXC: open edit mode with selected plan data
    setMode("manual");
    setEditingTaskId(task.id);
    setManualPlan({
      title: task.title,
      subtitle: task.subtitle || "",
      dueOption: task.dueText || getDueOptionFromDate(task.dueDate),
      studyTimeHours: getStudyTimeValue(task.studyTime ?? task.studyTimeHours),
      priority: task.priority || "MEDIUM",
      note: task.note || "",
    });
  };

  const handleModeChange = (nextMode) => {
    if (nextMode === "manual") {
      if (mode === "manual") {
        // GXC: reset and close manual form when Manual Edit is clicked again
        resetManualPlan();
        setMode("none");
        return;
      }

      // GXC: open manual create mode
      resetManualPlan();
      setMode("manual");
      return;
    }

    setMode((currentMode) => (currentMode === nextMode ? "none" : nextMode));
    if (nextMode !== "manual") {
      resetManualPlan();
    }
  };

  const handleDeleteTask = (task) => {
    setTaskToDelete(task);
  };

  const closeDeleteDialog = () => {
    setTaskToDelete(null);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) {
      return;
    }

    if (onDelete) {
      await onDelete(taskToDelete.id);
      closeDeleteDialog();
      return;
    }

    closeDeleteDialog();
  };

  const handleSubmitManualTask = async (event) => {
    event.preventDefault();

    const title = manualPlan.title.trim();

    if (!title) {
      showToast("Please enter a study plan title.", "warning");
      return;
    }

    // GXC: submit create or update request with backend-supported fields only
    const formData = {
      title,
      subtitle: manualPlan.subtitle || "",
      studyTime: formatStudyTimeValue(manualPlan.studyTimeHours),
      priority: manualPlan.priority,
      dueText: manualPlan.dueOption,
      note: manualPlan.note.trim(),
    };

    try {
      if (editingTaskId) {
        await onUpdate(editingTaskId, formData);
        showToast("Study plan updated successfully.", "success");
      } else {
        await onCreate(formData);
        showToast("Study plan added successfully.", "success");
      }

      resetManualPlan();
      setMode("none");
    } catch (err) {
      showToast(err.message || "Failed to save study plan.", "error");
    }
  };

  return (
    <div className={styles.card}>
      <PlanHeader
        activeMode={mode}
        onModeChange={handleModeChange}
      />

      {mode === "manual" && (
        <form className={styles.manualCard} onSubmit={handleSubmitManualTask}>
          <div className={styles.formHeader}>
            <div>
              <h3>{editingTaskId ? "Edit Study Plan" : "Create Study Plan"}</h3>
              <p>Customize the task, time, priority, and study note.</p>
            </div>

            {editingTaskId && (
              <button
                className={styles.ghostButton}
                type="button"
                onClick={resetManualPlan}
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className={styles.formGrid}>
            <label className={styles.titleField}>
              Plan Title
              <input
                type="text"
                value={manualPlan.title}
                onChange={(event) =>
                  updateManualPlan("title", event.target.value)
                }
                placeholder="Write a new study plan"
                aria-label="New study plan title"
              />
            </label>

            <label>
              Due
              <select
                value={manualPlan.dueOption}
                onChange={(event) =>
                  updateManualPlan("dueOption", event.target.value)
                }
                aria-label="New study plan due date"
              >
                <option>This Week</option>
                <option>Due Today</option>
                <option>Tomorrow</option>
                <option>Next Week</option>
              </select>
            </label>

            <label>
              Study Time
              <select
                value={manualPlan.studyTimeHours}
                onChange={(event) =>
                  updateManualPlan("studyTimeHours", Number(event.target.value))
                }
              >
                <option value={0.5}>30m</option>
                <option value={1}>1h</option>
                <option value={1.5}>1.5h</option>
                <option value={2}>2h</option>
                <option value={3}>3h</option>
              </select>
            </label>

            <label>
              Priority
              <select
                value={manualPlan.priority}
                onChange={(event) =>
                  updateManualPlan("priority", event.target.value)
                }
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </label>

            <label className={styles.noteField}>
              Study Note
              <textarea
                rows="3"
                value={manualPlan.note}
                onChange={(event) =>
                  updateManualPlan("note", event.target.value)
                }
                placeholder="Add chapters, resources, or review goals"
              />
            </label>
          </div>

          <button className={styles.submitButton} type="submit">
            {editingTaskId ? "Save Plan" : "Add Plan"}
          </button>
        </form>
      )}

      <div className={styles.taskList}>
        {visibleTasks.map((task) => (
          <TaskCard
            key={task.id}
            isCompleteLoading={loadingPlanId === task.id}
            task={task}
            onDelete={handleDeleteTask}
            onEdit={handleEditTask}
            onToggleComplete={handleToggleComplete}
          />
        ))}
      </div>

      {taskToDelete && (
        <div className={styles.dialogBackdrop} role="presentation">
          <div
            className={styles.confirmDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-task-title"
          >
            <button
              type="button"
              className={styles.dialogClose}
              aria-label="Close delete confirmation"
              onClick={closeDeleteDialog}
            >
              <X size={17} strokeWidth={2.4} />
            </button>

            <div className={styles.dialogIcon}>
              <Trash2 size={22} strokeWidth={2.4} />
            </div>

            <h3 id="delete-task-title">Delete study plan?</h3>
            <p>This will remove "{taskToDelete.title}" from your study plan.</p>

            <div className={styles.dialogActions}>
              <button type="button" onClick={closeDeleteDialog}>
                Cancel
              </button>
              <button type="button" onClick={confirmDeleteTask}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {shouldShowPagination && (
        <div className={styles.pagination} aria-label="Study plan pagination">
          <p>
            {pageRangeStart}-{pageRangeEnd} of {pagination.total} plans
          </p>

          <div className={styles.pageControls}>
            <button
              type="button"
              onClick={() => onPageChange(activePage - 1)}
              disabled={activePage === 1}
              aria-label="Previous page"
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;

              return (
                <button
                  key={pageNumber}
                  type="button"
                  className={
                    activePage === pageNumber ? styles.activePage : undefined
                  }
                  onClick={() => onPageChange(pageNumber)}
                  aria-current={activePage === pageNumber ? "page" : undefined}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => onPageChange(activePage + 1)}
              disabled={activePage === totalPages}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
