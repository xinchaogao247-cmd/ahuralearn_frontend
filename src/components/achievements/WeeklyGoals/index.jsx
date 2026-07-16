import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";

import { showToast } from "../../common/toast";
import GoalItem from "../GoalItem";
import styles from "./WeeklyGoals.module.css";

const emptyGoalForm = {
  title: "",
  type: "Course",
  current: "0",
  total: "5",
  dueDay: "Friday",
};

const GOALS_PER_PAGE = 4;

export default function WeeklyGoals({
  goals,
  onAddGoal,
  onCompleteGoal,
  onDeleteGoal,
  onUpdateGoal,
}) {
  const [localGoals, setLocalGoals] = useState(goals);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [goalForm, setGoalForm] = useState(emptyGoalForm);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [loadingGoalId, setLoadingGoalId] = useState(null);

  useEffect(() => {
    setLocalGoals(goals);
  }, [goals]);

  const goalStats = useMemo(() => {
    const achievedCount = localGoals.filter((goal) => goal.achieved).length;

    return {
      achievedCount,
      totalCount: localGoals.length,
    };
  }, [localGoals]);

  const totalPages = Math.max(1, Math.ceil(localGoals.length / GOALS_PER_PAGE));
  const activePage = Math.min(currentPage, totalPages);
  const pageStartIndex = (activePage - 1) * GOALS_PER_PAGE;
  const paginatedGoals = localGoals.slice(
    pageStartIndex,
    pageStartIndex + GOALS_PER_PAGE
  );
  const pageRangeStart = localGoals.length === 0 ? 0 : pageStartIndex + 1;
  const pageRangeEnd = Math.min(
    pageStartIndex + GOALS_PER_PAGE,
    localGoals.length
  );
  const shouldShowPagination = localGoals.length > GOALS_PER_PAGE;

  const updateGoalForm = (field, value) => {
    setGoalForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setGoalForm(emptyGoalForm);
    setEditingGoalId(null);
  };

  const openAddForm = () => {
    if (isFormOpen && !editingGoalId) {
      closeForm();
      return;
    }

    setIsFormOpen(true);
    setEditingGoalId(null);
    setGoalForm(emptyGoalForm);
  };

  const handleEditGoal = (goal) => {
    setIsFormOpen(true);
    setEditingGoalId(goal.id);
    setGoalForm({
      title: goal.title,
      type: goal.type || "Learning",
      current: String(goal.currentValue),
      total: String(goal.totalValue),
      dueDay: goal.dueDay || "Friday",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const goalTitle = goalForm.title.trim();
    const totalTarget = Number(goalForm.total);
    const currentProgress = Number(goalForm.current);

    if (!goalTitle || totalTarget <= 0 || currentProgress < 0) {
      const message = "Enter a title, valid progress, and a target greater than 0.";

      showToast(message, "warning");
      return;
    }

    if (currentProgress > totalTarget) {
      const message = "Current progress cannot be greater than the total target.";

      showToast(message, "warning");
      return;
    }

    const goalPayload = {
      title: goalTitle,
      type: goalForm.type,
      currentValue: currentProgress,
      totalValue: totalTarget,
      dueDay: goalForm.dueDay,
    };

    try {
      setIsSaving(true);

      if (editingGoalId) {
        const refreshedGoals = await onUpdateGoal(editingGoalId, goalPayload);
        setLocalGoals(refreshedGoals);
        showToast("Weekly goal updated successfully.", "success");
      } else {
        const refreshedGoals = await onAddGoal(goalPayload);
        setLocalGoals(refreshedGoals);
        setCurrentPage(1);
        showToast("Weekly goal added successfully.", "success");
      }

      closeForm();
    } catch {
      const message = editingGoalId
        ? "Could not update weekly goal."
        : "Could not add weekly goal.";

      showToast(message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleIncrementGoal = async (goalId) => {
    const goal = localGoals.find((item) => item.id === goalId);
    if (!goal || goal.achieved) return;

    const goalPayload = {
      title: goal.title,
      type: goal.type,
      currentValue: Math.min(goal.currentValue + 1, goal.totalValue),
      totalValue: goal.totalValue,
      dueDay: goal.dueDay,
    };

    try {
      const refreshedGoals = await onUpdateGoal(goalId, goalPayload);
      setLocalGoals(refreshedGoals);
    } catch {
      showToast("Could not update weekly goal.", "error");
    }
  };

  const handleToggleCompleteGoal = async (goalId) => {
    const goal = localGoals.find((item) => item.id === goalId);
    if (!goal) return;

    try {
      setLoadingGoalId(goalId);
      const refreshedGoals = await onCompleteGoal(goalId);
      setLocalGoals(refreshedGoals);
      showToast(
        goal.achieved
          ? "Weekly goal marked incomplete."
          : "Weekly goal completed successfully.",
        "success"
      );
    } catch (err) {
      showToast(err.message || "Could not update weekly goal.", "error");
    } finally {
      setLoadingGoalId(null);
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      const refreshedGoals = await onDeleteGoal(goalId);
      setLocalGoals(refreshedGoals);
      if (editingGoalId === goalId) closeForm();
      showToast("Weekly goal deleted successfully.", "success");
    } catch {
      showToast("Could not delete weekly goal.", "error");
    }
  };

  const handleDeleteGoal = (goal) => {
    setGoalToDelete(goal);
  };

  const closeDeleteDialog = () => {
    setGoalToDelete(null);
  };

  const confirmDeleteGoal = async () => {
    if (!goalToDelete) {
      return;
    }

    await deleteGoal(goalToDelete.id);
    closeDeleteDialog();
  };

  return (
    <section className={styles.weeklyGoals}>
      <div className={styles.header}>
        <div>
          <h2>Weekly Goals</h2>
          <p>
            {goalStats.achievedCount}/{goalStats.totalCount} goals achieved this
            week
          </p>
        </div>

        <button
          type="button"
          aria-label={isFormOpen ? "Close weekly goal form" : "Add weekly goal"}
          onClick={openAddForm}
        >
          {isFormOpen ? (
            <X size={21} strokeWidth={2.3} />
          ) : (
            <Plus size={22} strokeWidth={2.3} />
          )}
        </button>
      </div>

      {isFormOpen ? (
        <div className={styles.formPanel}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formHeader}>
              <div>
                <h3>{editingGoalId ? "Edit Weekly Goal" : "Create Weekly Goal"}</h3>
                <p>Set the target, current progress, and due day.</p>
              </div>
            </div>

            <div className={styles.formGrid}>
              <label className={styles.titleField}>
                Goal title
                <input
                  type="text"
                  value={goalForm.title}
                  onChange={(event) => updateGoalForm("title", event.target.value)}
                  placeholder="Complete 5 React lessons"
                />
              </label>

              <label>
                Goal type
                <select
                  value={goalForm.type}
                  onChange={(event) => updateGoalForm("type", event.target.value)}
                >
                  <option>Course</option>
                  <option>Practice</option>
                  <option>Exam</option>
                  <option>Streak</option>
                  <option>Project</option>
                </select>
              </label>

              <label>
                Current
                <input
                  type="number"
                  min="0"
                  value={goalForm.current}
                  onChange={(event) =>
                    updateGoalForm("current", event.target.value)
                  }
                />
              </label>

              <label>
                Target
                <input
                  type="number"
                  min="1"
                  value={goalForm.total}
                  onChange={(event) => updateGoalForm("total", event.target.value)}
                />
              </label>

              <label>
                Due day
                <select
                  value={goalForm.dueDay}
                  onChange={(event) => updateGoalForm("dueDay", event.target.value)}
                >
                  <option>Monday</option>
                  <option>Tuesday</option>
                  <option>Wednesday</option>
                  <option>Thursday</option>
                  <option>Friday</option>
                  <option>Saturday</option>
                  <option>Sunday</option>
                </select>
              </label>
            </div>

            <div className={styles.formActions}>
              <button type="button" onClick={closeForm}>
                Cancel
              </button>
              <button type="submit" disabled={isSaving}>
                {isSaving
                  ? editingGoalId
                    ? "Saving..."
                    : "Adding..."
                  : editingGoalId
                    ? "Save Goal"
                    : "Add Goal"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className={styles.goalList}>
        {paginatedGoals.map((goal) => (
          <GoalItem
            key={goal.id}
            goal={goal}
            isCompleteLoading={loadingGoalId === goal.id}
            onComplete={handleToggleCompleteGoal}
            onDelete={handleDeleteGoal}
            onEdit={handleEditGoal}
            onIncrement={handleIncrementGoal}
            onToggleComplete={handleToggleCompleteGoal}
          />
        ))}
      </div>

      {goalToDelete && (
        <div className={styles.dialogBackdrop} role="presentation">
          <div
            className={styles.confirmDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-weekly-goal-title"
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

            <h3 id="delete-weekly-goal-title">Delete weekly goal?</h3>
            <p>This will remove "{goalToDelete.title}" from your weekly goals.</p>

            <div className={styles.dialogActions}>
              <button type="button" onClick={closeDeleteDialog}>
                Cancel
              </button>
              <button type="button" onClick={confirmDeleteGoal}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {shouldShowPagination && (
        <div className={styles.pagination} aria-label="Weekly goals pagination">
          <p>
            {pageRangeStart}-{pageRangeEnd} of {localGoals.length} goals
          </p>

          <div className={styles.pageControls}>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
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
                  onClick={() => setCurrentPage(pageNumber)}
                  aria-current={activePage === pageNumber ? "page" : undefined}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={activePage === totalPages}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
