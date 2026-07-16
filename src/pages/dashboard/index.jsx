import { useEffect, useState } from "react";

import DashboardStats from "../../components/dashboard/DashboardStats";
import LearningCard from "../../components/dashboard/LearningCard";
import PageShell from "../../components/profileLayout/PageShell";
import { getLearningDashboard } from "../../api/learning/dashboard";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadDashboardData() {
      try {
        setDashboardLoading(true);
        setDashboardError(null);

        const data = await getLearningDashboard();

        if (!ignore) {
          setDashboardData(data);
        }
      } catch (err) {
        if (!ignore) {
          setDashboardError(err);
        }
      } finally {
        if (!ignore) {
          setDashboardLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      ignore = true;
    };
  }, []);

  const dashboardEmpty =
    !dashboardLoading &&
    !dashboardError &&
    (!dashboardData ||
      (!dashboardData.progress &&
        (dashboardData.ongoingCourses?.length ?? 0) === 0 &&
        !dashboardData.overview));

  const progress = dashboardData?.progress ?? null;
  const empty = dashboardEmpty || !progress;

  if (dashboardLoading) {
    return (
      <PageShell>
        <main className={styles.dashboard}>Loading...</main>
      </PageShell>
    );
  }

  if (dashboardError) {
    return (
      <PageShell>
        <main className={styles.dashboard}>Failed to load data</main>
      </PageShell>
    );
  }

  if (empty) {
    return (
      <PageShell>
        <main className={styles.dashboard}>No dashboard data found</main>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main className={styles.dashboard}>
        <section className={styles.leftSection}>
          <LearningCard progress={progress} />
        </section>

        <section className={styles.rightSection}>
          <DashboardStats
            courses={dashboardData.ongoingCourses}
            stats={dashboardData.overview}
          />
        </section>
      </main>
    </PageShell>
  );
}
