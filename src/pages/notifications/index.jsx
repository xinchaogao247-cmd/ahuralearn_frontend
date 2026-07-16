import { useCallback, useEffect, useMemo, useState } from "react";

import ExpiringPlanCard from "../../components/notifications/ExpiringPlanCard";
import PageShell from "../../components/profileLayout/PageShell";
import {
  acknowledgeNotification,
  deleteNotification,
  getNotificationsData,
} from "../../api/notification/notifications";
import styles from "./Notifications.module.css";

const NOTIFICATIONS_PER_PAGE = 4;
const notificationsUpdatedEvent = "notifications-updated";
const priorityRank = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

function sortNotifications(plans) {
  return [...plans].sort((firstPlan, secondPlan) => {
    const dateDifference =
      new Date(firstPlan.dueDate).getTime() -
      new Date(secondPlan.dueDate).getTime();

    if (dateDifference !== 0) {
      return dateDifference;
    }

    return (
      (priorityRank[firstPlan.priority] ?? 99) -
      (priorityRank[secondPlan.priority] ?? 99)
    );
  });
}

function normalizeNotificationsData(data) {
  const safeData = data ?? {};
  const expiringPlans = Array.isArray(data)
    ? data
    : safeData.expiringPlans ?? safeData.records ?? safeData.list ?? [];

  return {
    ...safeData,
    expiringPlans: sortNotifications(expiringPlans),
    total: safeData.total ?? expiringPlans.length,
  };
}

function notifyNotificationsUpdated() {
  window.dispatchEvent(new Event(notificationsUpdatedEvent));
}

export default function Notifications() {
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNotificationsData = useCallback(
    async ({ showLoading = true } = {}) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        setError(null);

        const notificationsData = await getNotificationsData({
          pageNum: currentPage,
          pageSize: NOTIFICATIONS_PER_PAGE,
        });
        const preparedNotificationsData =
          normalizeNotificationsData(notificationsData);

        setData(preparedNotificationsData);
      } catch (err) {
        setError(err);
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [currentPage]
  );

  useEffect(() => {
    let ignore = false;

    async function loadCurrentPage() {
      try {
        setLoading(true);
        setError(null);

        const notificationsData = await getNotificationsData({
          pageNum: currentPage,
          pageSize: NOTIFICATIONS_PER_PAGE,
        });
        const preparedNotificationsData =
          normalizeNotificationsData(notificationsData);

        if (!ignore) {
          setData(preparedNotificationsData);
        }
      } catch (err) {
        if (!ignore) {
          setError(err);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadCurrentPage();

    return () => {
      ignore = true;
    };
  }, [currentPage]);

  const expiringPlans = useMemo(() => data?.expiringPlans ?? [], [data]);
  const totalNotifications = data?.total ?? expiringPlans.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalNotifications / NOTIFICATIONS_PER_PAGE)
  );
  const activePage = Math.min(currentPage, totalPages);
  const pageStartIndex = (activePage - 1) * NOTIFICATIONS_PER_PAGE;
  const pageRangeStart =
    totalNotifications === 0 ? 0 : pageStartIndex + 1;
  const pageRangeEnd = Math.min(
    pageStartIndex + expiringPlans.length,
    totalNotifications
  );
  const shouldShowPagination = totalNotifications > NOTIFICATIONS_PER_PAGE;
  const empty = !loading && !error && expiringPlans.length === 0;

  const refreshAfterMutation = async () => {
    await loadNotificationsData({ showLoading: false });
    notifyNotificationsUpdated();
  };

  const acknowledgePlan = async (notificationId) => {
    await acknowledgeNotification(notificationId);
    await refreshAfterMutation();
  };

  const deletePlan = async (notificationId) => {
    await deleteNotification(notificationId);

    if (expiringPlans.length === 1 && currentPage > 1) {
      setCurrentPage((page) => page - 1);
      notifyNotificationsUpdated();
    } else {
      await refreshAfterMutation();
    }
  };

  return (
    <PageShell showSubNav={false}>
      <main className={styles.notificationsPage}>
        <section className={styles.header}>
          <div>
            <h1>Notifications</h1>
            <p>Study plans that are getting close to their deadline.</p>
          </div>

          <span>{totalNotifications} expiring</span>
        </section>

        {loading && (
          <section className={styles.pageStatus}>Loading notifications...</section>
        )}

        {error && (
          <section className={styles.pageStatus}>Failed to load notifications</section>
        )}

        {empty && (
          <section className={styles.pageStatus}>No expiring study plans</section>
        )}

        {!loading && !error && expiringPlans.length > 0 && (
          <section className={styles.planList}>
            {expiringPlans.map((plan) => (
              <ExpiringPlanCard
                key={plan.id}
                onAcknowledge={acknowledgePlan}
                onDelete={deletePlan}
                plan={plan}
              />
            ))}
          </section>
        )}

        {shouldShowPagination && (
          <nav
            className={styles.pagination}
            aria-label="Notifications pagination"
          >
            <p>
              {pageRangeStart}-{pageRangeEnd} of {totalNotifications} alerts
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
                    aria-current={
                      activePage === pageNumber ? "page" : undefined
                    }
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
          </nav>
        )}
      </main>
    </PageShell>
  );
}
