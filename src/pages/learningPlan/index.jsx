import { useEffect, useState } from "react";

import LearningSummary from "../../components/learningPlan/LearningSummary";
import StudyStats from "../../components/learningPlan/StudyStats";
import PageShell from "../../components/profileLayout/PageShell";
import {
  completeStudyPlan,
  createStudyPlan,
  deleteStudyPlan,
  getLearningPlanData,
  updateStudyPlan,
} from "../../api/learning/learningPlan";
import { getLearningDashboard } from "../../api/learning/dashboard";
import { showToast } from "../../components/common/toast";
import styles from "./LearningPlan.module.css";

export default function LearningPlan() {
  const [learningPlanData, setLearningPlanData] = useState(null);
  const [learningPlanLoading, setLearningPlanLoading] = useState(true);
  const [learningPlanError, setLearningPlanError] = useState(null);

  const [progress, setProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState(null);
  const [loadingPlanId, setLoadingPlanId] = useState(null);

  const refreshLearningPlanData = async (pageNum, pageSize) => {
    try {
      setLearningPlanLoading(true);
      setLearningPlanError(null);

      let data = await getLearningPlanData(pageNum, pageSize);

      // GXC: fall back to the new last page after deleting its final record
      if (
        data.pagination.total > 0 &&
        data.planner.tasks.length === 0 &&
        pageNum > data.pagination.pages
      ) {
        data = await getLearningPlanData(
          data.pagination.pages,
          data.pagination.pageSize
        );
      }

      setLearningPlanData(data);
    } catch (err) {
      setLearningPlanError(err);
      throw err;
    } finally {
      setLearningPlanLoading(false);
    }
  };

  const refreshLearningProgress = async () => {
    const dashboardData = await getLearningDashboard();
    setProgress(dashboardData?.progress ?? null);
    return dashboardData?.progress ?? null;
  };

  const refreshPlanAndProgress = async () => {
    await Promise.all([
      refreshLearningPlanData(
        learningPlanData.pagination.pageNum,
        learningPlanData.pagination.pageSize
      ),
      refreshLearningProgress(),
    ]);
  };

  useEffect(() => {
    let ignore = false;

    async function loadLearningPlanData() {
      try {
        setLearningPlanLoading(true);
        setLearningPlanError(null);

        const data = await getLearningPlanData();

        if (!ignore) {
          setLearningPlanData(data);
        }
      } catch (err) {
        if (!ignore) {
          setLearningPlanError(err);
        }
      } finally {
        if (!ignore) {
          setLearningPlanLoading(false);
        }
      }
    }

    loadLearningPlanData();

    return () => {
      ignore = true;
    };
  }, []);

  const handleCompletePlan = async (id) => {
    const task = learningPlanData.planner.tasks.find((item) => item.id === id);
    if (!task) return;

    try {
      setLoadingPlanId(id);
      await completeStudyPlan(id);
      await refreshPlanAndProgress();
      showToast(
        task.completed
          ? "Study plan marked incomplete."
          : "Study plan completed successfully.",
        "success"
      );
    } catch (err) {
      showToast(err.message || "Could not update study plan.", "error");
    } finally {
      setLoadingPlanId(null);
    }
  };

  const handleDeletePlan = async (id) => {
    await deleteStudyPlan(id);
    await refreshLearningPlanData(
      learningPlanData.pagination.pageNum,
      learningPlanData.pagination.pageSize
    );
  };

  const handleCreatePlan = async (formData) => {
    // GXC: create study plan through backend API
    await createStudyPlan(formData);
    // GXC: refresh latest learning plan list
    await refreshLearningPlanData(1, learningPlanData.pagination.pageSize);
  };

  const handleUpdatePlan = async (id, formData) => {
    // GXC: update selected study plan through backend API
    await updateStudyPlan(id, formData);
    // GXC: refresh latest learning plan list after update
    await refreshLearningPlanData(
      learningPlanData.pagination.pageNum,
      learningPlanData.pagination.pageSize
    );
  };

  const handlePageChange = async (pageNum) => {
    await refreshLearningPlanData(
      pageNum,
      learningPlanData.pagination.pageSize
    );
  };

  useEffect(() => {
    let ignore = false;

    async function loadLearningProgress() {
      try {
        setProgressLoading(true);
        setProgressError(null);

        if (!ignore) {
          await refreshLearningProgress();
        }
      } catch (err) {
        if (!ignore) {
          setProgressError(err);
        }
      } finally {
        if (!ignore) {
          setProgressLoading(false);
        }
      }
    }

    loadLearningProgress();

    return () => {
      ignore = true;
    };
  }, []);

  const loading = learningPlanLoading || progressLoading;
  const error = learningPlanError || progressError;
  const empty = !learningPlanData || !progress;

  if (loading) {
    return (
      <PageShell>
        <main className={styles.learningPage}>Loading...</main>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <main className={styles.learningPage}>Failed to load data</main>
      </PageShell>
    );
  }

  if (empty) {
    return (
      <PageShell>
        <main className={styles.learningPage}>No learning tasks found</main>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main className={styles.learningPage}>
        <LearningSummary progress={progress} />
        <StudyStats
          planner={learningPlanData.planner}
          pagination={learningPlanData.pagination}
          loadingPlanId={loadingPlanId}
          onComplete={handleCompletePlan}
          onCreate={handleCreatePlan}
          onDelete={handleDeletePlan}
          onUpdate={handleUpdatePlan}
          onPageChange={handlePageChange}
        />
      </main>
    </PageShell>
  );
}
