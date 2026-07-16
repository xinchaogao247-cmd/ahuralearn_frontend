import { useEffect, useMemo, useState } from "react";

import ContinueLearning from "../../components/courses/ContinueLearning";
import CourseHeader from "../../components/courses/CourseHeader";
import CourseStats from "../../components/courses/CourseStats";
import PageShell from "../../components/profileLayout/PageShell";
import { getLearningCourses } from "../../api/course/course";
import {
  deleteWeeklyGoal,
  getWeeklyGoals,
} from "../../api/learning/goals";
import styles from "./Courses.module.css";

export default function Courses() {
  const [coursesData, setCoursesData] = useState(null);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);

  const [goals, setGoals] = useState([]);
  const [, setGoalsLoading] = useState(true);
  const [, setGoalsError] = useState(null);

  const [activeFilter, setActiveFilter] = useState("All");
  const [goalToDelete, setGoalToDelete] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadCoursesData() {
      try {
        setCoursesLoading(true);
        setCoursesError(null);

        const statusByFilter = {
          All: "ALL",
          "In Progress": "IN_PROGRESS",
          Completed: "COMPLETED",
        };
        const data = await getLearningCourses(statusByFilter[activeFilter]);

        if (!ignore) {
          setCoursesData(data);
        }
      } catch (err) {
        if (!ignore) {
          setCoursesError(err);
        }
      } finally {
        if (!ignore) {
          setCoursesLoading(false);
        }
      }
    }

    loadCoursesData();

    return () => {
      ignore = true;
    };
  }, [activeFilter]);

  useEffect(() => {
    let ignore = false;

    async function loadWeeklyGoals() {
      try {
        setGoalsLoading(true);
        setGoalsError(null);

        const weeklyGoals = await getWeeklyGoals();

        if (!ignore) {
          setGoals(weeklyGoals);
        }
      } catch (err) {
        if (!ignore) {
          setGoalsError(err);
        }
      } finally {
        if (!ignore) {
          setGoalsLoading(false);
        }
      }
    }

    loadWeeklyGoals();

    return () => {
      ignore = true;
    };
  }, []);

  const activeGoals = useMemo(
    () =>
      goals.filter((goal) => {
        const currentValue = goal.currentValue ?? goal.current ?? 0;
        const totalValue = goal.totalValue ?? goal.total ?? 0;

        return !goal.achieved && (totalValue === 0 || currentValue < totalValue);
      }),
    [goals]
  );

  const closeDeleteDialog = () => {
    setGoalToDelete(null);
  };

  const confirmDeleteGoal = async () => {
    if (!goalToDelete) {
      return;
    }

    await deleteWeeklyGoal(goalToDelete.id);
    setGoals((currentGoals) =>
      currentGoals.filter((goal) => goal.id !== goalToDelete.id)
    );
    closeDeleteDialog();
  };

  const displayedData = coursesData ?? {
    inProgressCourses: 0,
    courses: [],
    categories: [],
  };

  return (
    <PageShell>
      <main className={styles.coursesPage}>
        <CourseHeader
          inProgressCourses={displayedData.inProgressCourses}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        <div className={styles.coursesLayout}>
          {coursesLoading ? (
            <section className={styles.stateMessage}>Loading courses...</section>
          ) : coursesError ? (
            <section className={styles.stateMessage} role="alert">
              Failed to load courses. Please try again.
            </section>
          ) : (
            <ContinueLearning courses={displayedData.courses} />
          )}
          <CourseStats
            categories={displayedData.categories}
            goal={displayedData.goal}
            goals={activeGoals}
            goalToDelete={goalToDelete}
            onRequestDeleteGoal={setGoalToDelete}
            onCancelDeleteGoal={closeDeleteDialog}
            onConfirmDeleteGoal={confirmDeleteGoal}
          />
        </div>
      </main>
    </PageShell>
  );
}
