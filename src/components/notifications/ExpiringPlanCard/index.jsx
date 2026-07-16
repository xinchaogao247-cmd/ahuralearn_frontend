import { useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  Trash2,
} from "lucide-react";

import styles from "./ExpiringPlanCard.module.css";

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
  const normalizedPriority = (priority ?? "MEDIUM").toLowerCase();

  return `${normalizedPriority.charAt(0).toUpperCase()}${normalizedPriority.slice(1)}`;
}

function getDaysLeft(dueDate) {
  const today = new Date(toDateKey(new Date()));
  const due = new Date(dueDate);
  const dayInMs = 24 * 60 * 60 * 1000;

  return Math.max(0, Math.ceil((due.getTime() - today.getTime()) / dayInMs));
}

function getStatusLabel(daysLeft) {
  if (daysLeft <= 1) {
    return "Due Soon";
  }

  if (daysLeft === 2 || daysLeft === 6) {
    return "Pending";
  }

  if (daysLeft === 3 || daysLeft === 7) {
    return "Scheduled";
  }

  if (daysLeft === 4) {
    return "In Review";
  }

  if (daysLeft === 5) {
    return "Action Needed";
  }

  return "Draft";
}

function formatEstimatedTime(minutes) {
  const safeMinutes = Number(minutes) || 0;

  if (safeMinutes < 60) {
    return `${safeMinutes} min`;
  }

  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function getTrackLabel(courseName) {
  const safeCourseName = String(courseName ?? "");

  if (safeCourseName.includes("React")) {
    return "React Learning Track";
  }

  if (safeCourseName.includes("Machine Learning")) {
    return "AI Certification Path";
  }

  if (safeCourseName.includes("UI/UX") || safeCourseName.includes("UX")) {
    return "Design Fundamentals Track";
  }

  if (safeCourseName.includes("Database")) {
    return "Data Science Track";
  }

  if (safeCourseName.includes("Python")) {
    return "Python Learning Track";
  }

  return "Web Development Track";
}

export default function ExpiringPlanCard({
  onAcknowledge,
  onDelete,
  plan,
}) {
  const [expanded, setExpanded] = useState(false);
  const daysLeft = getDaysLeft(plan.dueDate);
  const lastUpdated = toDateKey(addDays(new Date(plan.dueDate), -1));
  const nextSteps = Array.isArray(plan.nextSteps) ? plan.nextSteps : [];

  const handleAcknowledge = (event) => {
    event.stopPropagation();

    if (!plan.isAcknowledged) {
      onAcknowledge(plan.id);
    }
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    onDelete(plan.id);
  };

  const toggleExpanded = () => {
    setExpanded((current) => !current);
  };

  return (
    <article
      aria-expanded={expanded}
      className={`${styles.card} ${expanded ? styles.expandedCard : ""}`}
      role="button"
      tabIndex={0}
      onClick={toggleExpanded}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleExpanded();
        }
      }}
    >
      <div className={styles.iconWrap}>
        <AlertCircle size={24} strokeWidth={2.4} />
      </div>

      <div className={styles.content}>
        <div className={styles.titleRow}>
          <div>
            <h2>{plan.title}</h2>
            <p>{plan.courseName}</p>
          </div>

          <span className={styles.priority}>{formatPriority(plan.priority)}</span>
        </div>

        <div className={styles.metaRow}>
          <span>
            <CalendarDays size={16} strokeWidth={2.3} />
            Due {plan.dueDate}
          </span>

          <strong>{daysLeft} days left</strong>

          <span className={styles.status}>{getStatusLabel(daysLeft)}</span>
        </div>

        {expanded && (
          <div className={styles.detailsPanel}>
            <p className={styles.description}>
              {plan.description || "No additional details available."}
            </p>

            <div className={styles.detailGrid}>
              <div>
                <span>Progress</span>
                <strong>{plan.progress}%</strong>
              </div>

              <div>
                <span>Estimated time</span>
                <strong>{formatEstimatedTime(plan.estimatedMinutes)}</strong>
              </div>

              <div>
                <span>Track</span>
                <strong>{getTrackLabel(plan.courseName)}</strong>
              </div>

              <div>
                <span>Last updated</span>
                <strong>{lastUpdated}</strong>
              </div>
            </div>

            <div className={styles.nextSteps}>
              <h3>Next steps</h3>

              <ul>
                {nextSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className={styles.actionRow}>
          <span className={styles.expandHint}>
            <ChevronDown
              className={expanded ? styles.chevronOpen : ""}
              size={16}
              strokeWidth={2.4}
            />
            {expanded ? "Hide details" : "View details"}
          </span>

          <button
            className={styles.ackButton}
            disabled={plan.isAcknowledged}
            type="button"
            onClick={handleAcknowledge}
          >
            {plan.isAcknowledged ? "Acknowledged" : "Got it"}
          </button>

          <button
            aria-label={`Delete notification for ${plan.title}`}
            className={styles.deleteButton}
            type="button"
            onClick={handleDelete}
          >
            <Trash2 size={16} strokeWidth={2.3} />
          </button>
        </div>
      </div>
    </article>
  );
}
