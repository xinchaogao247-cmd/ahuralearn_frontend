import { useEffect, useState } from "react";

import AchievementSummary from "../../components/achievements/AchievementSummary";
import WeeklyGoals from "../../components/achievements/WeeklyGoals";
import PageShell from "../../components/profileLayout/PageShell";
import {
  completeGoal,
  createGoal,
  deleteGoal,
  getGoals,
  updateGoal,
} from "../../api/learning/goals";
import { getAchievementSummary } from "../../api/learning/achievements";
import { getLearningDashboard } from "../../api/learning/dashboard";
import styles from "./Achievements.module.css";

const emptyAchievementSummary = {
  totalAchievements: 0,
  certificatesEarned: 0,
  certificationName: "No Certificate In Progress",
  certificationProgress: 0,
};

function Achievements() {
  const [data, setData] = useState(null);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [achievementsError, setAchievementsError] = useState(null);

  const [goals, setGoals] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [goalsError, setGoalsError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadAchievementsData() {
      try {
        setAchievementsLoading(true);
        setAchievementsError(null);

        const achievementSummary = await getAchievementSummary();

        if (!ignore) {
          setData(achievementSummary ?? emptyAchievementSummary);
        }
      } catch (err) {
        if (!ignore) {
          setAchievementsError(err);
        }
      } finally {
        if (!ignore) {
          setAchievementsLoading(false);
        }
      }
    }

    loadAchievementsData();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadWeeklyGoals() {
      try {
        setGoalsLoading(true);
        setGoalsError(null);

        const weeklyGoals = await getGoals();

        if (!ignore) {
          setGoals(Array.isArray(weeklyGoals) ? weeklyGoals : []);
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

  const summaryData = {
    ...emptyAchievementSummary,
    ...(data ?? {}),
  };

  const refreshGoals = async () => {
    const weeklyGoals = await getGoals();
    const normalizedGoals = Array.isArray(weeklyGoals) ? weeklyGoals : [];
    setGoals(normalizedGoals);
    return normalizedGoals;
  };

  const refreshAchievements = async () => {
    const achievementSummary = await getAchievementSummary();
    const normalizedSummary = achievementSummary ?? emptyAchievementSummary;
    setData(normalizedSummary);
    return normalizedSummary;
  };

  const addGoal = async (goalData) => {
    await createGoal(goalData);
    return refreshGoals();
  };

  const editGoal = async (id, goalData) => {
    await updateGoal(id, goalData);
    const [weeklyGoals] = await Promise.all([
      refreshGoals(),
      refreshAchievements(),
    ]);
    return weeklyGoals;
  };

  const markGoalComplete = async (id) => {
    await completeGoal(id);
    const [weeklyGoals] = await Promise.all([
      refreshGoals(),
      refreshAchievements(),
      getLearningDashboard().catch(() => null),
    ]);
    return weeklyGoals;
  };

  const removeGoal = async (id) => {
    await deleteGoal(id);
    return refreshGoals();
  };

  const loading = achievementsLoading || goalsLoading;
  const error = achievementsError || goalsError;

  if (loading) {
    return (
      <PageShell>
        <main className={styles.achievementsPage}>
          Loading achievements...
        </main>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <main className={styles.achievementsPage}>
          Failed to load achievements
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main className={styles.achievementsPage}>
        <AchievementSummary summary={summaryData} />

        <WeeklyGoals
          goals={goals}
          onAddGoal={addGoal}
          onCompleteGoal={markGoalComplete}
          onDeleteGoal={removeGoal}
          onUpdateGoal={editGoal}
        />
      </main>
    </PageShell>
  );
}

export default Achievements;
