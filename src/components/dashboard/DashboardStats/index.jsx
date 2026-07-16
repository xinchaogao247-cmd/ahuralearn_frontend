import { Link } from "react-router-dom";

import StatsCard from "../StatsCard";
import styles from "./DashboardStats.module.css";

export default function DashboardStats({ courses = [], stats = {} }) {
  const achievementStats = [
    {
      value: String(stats.achievements ?? 0),
      label: "Achievements",
    },
    {
      value: String(stats.certificates ?? 0).padStart(2, "0"),
      label: "Certificates",
    },
    {
      value: String(stats.completedCourses ?? 0),
      label: "Completed Courses",
    },
    {
      value: String(stats.ongoingCourses ?? 0),
      label: "Ongoing Courses",
    },
  ];

  return (
    <>
      <div className={styles.section}>
        <div className={styles.header}>
          <h2>Ongoing Courses</h2>
          <Link to="/courses" className={styles.viewAll}>
            View All
          </Link>
        </div>

        {courses.map((course) => (
          <div key={course.id} className={styles.courseCard}>
            <div className={styles.courseTop}>
              <h3>{course.title}</h3>
              <div className={styles.status}>{course.status.replaceAll("_", " ")}</div>
            </div>

            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ "--progress-target": `${course.progress}%` }}
              />
            </div>

            <div className={styles.courseBottom}>
              <span>{course.progress}% Complete</span>
              <span>
                {course.learnedSections}/{course.totalSections} Lessons
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <div className={styles.header}>
          <h2>Learning Overview</h2>
        </div>

        <div className={styles.statsGrid}>
          {achievementStats.map((stat) => (
            <StatsCard key={stat.label} stat={stat} className={styles.statCard} />
          ))}
        </div>
      </div>
    </>
  );
}
