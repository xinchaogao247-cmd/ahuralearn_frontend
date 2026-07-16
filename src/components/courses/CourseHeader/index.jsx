import styles from "./CourseHeader.module.css";

const filters = ["All", "In Progress", "Completed"];

export default function CourseHeader({ inProgressCourses, activeFilter, onFilterChange }) {
  const courseCount = inProgressCourses ?? 0;

  return (
    <div className={styles.header}>
      <div>
        <h1>My Courses</h1>
        <p>You have {courseCount} courses in progress this week.</p>
      </div>

      <div className={styles.filters}>
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={filter === activeFilter ? styles.active : undefined}
            onClick={() => onFilterChange(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}
