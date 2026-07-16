import { Link } from "react-router-dom";

import gameIcon from "../../../assets/icons/game-button.png";
import reactImg from "../../../assets/images/react-course.png";
import pythonImg from "../../../assets/images/python-course.png";
import uiuxImg from "../../../assets/images/uiux-course.png";
import CourseProgress from "../CourseProgress";
import styles from "./CourseCard.module.css";

const cx = (...names) => names.map((name) => styles[name]).filter(Boolean).join(" ");
const secondaryProgressCourseIds = new Set([2, 7, 10]);
const courseImages = {
  1: reactImg,
  2: pythonImg,
  3: uiuxImg,
  4: pythonImg,
  5: uiuxImg,
  6: reactImg,
  7: reactImg,
  8: pythonImg,
  9: uiuxImg,
  10: pythonImg,
  11: reactImg,
  12: uiuxImg,
};
const categoryImages = {
  DEVELOPMENT: reactImg,
  DESIGN: uiuxImg,
  DATA_SCIENCE: pythonImg,
};

/**
 * @typedef {Object} LearningCourseCard
 * @property {string} id
 * @property {string} title
 * @property {string | null | undefined} subtitle
 * @property {string} instructor
 * @property {string} image
 * @property {number} rating
 * @property {number} reviewCount
 * @property {number} learnedSections
 * @property {number} totalSections
 * @property {number} progress
 * @property {"IN_PROGRESS" | "COMPLETED"} status
 * @property {string | null | undefined} latestSectionId
 */

/**
 * @param {LearningCourseCard} course
 */
function getCourseLearningPath(course) {
  if (course.latestSectionId) {
    return `/learning/${course.id}/${course.latestSectionId}`;
  }

  return `/course/${course.id}`;
}

function getCourseGamePath(course) {
  return `/course/${course.id}/game`;
}

function getCourseReviewPath(course) {
  return `/courses/${course.id}/review`;
}

function formatReviewCount(reviewCount) {
  if (reviewCount >= 1000) {
    return `${(reviewCount / 1000).toFixed(1)}k`;
  }

  return String(reviewCount);
}

export default function CourseCard({ course }) {
  const courseImage = course.image ?? courseImages[course.id] ?? categoryImages[course.category] ?? reactImg;
  const badgeClass = course.status === "COMPLETED" ? "completed" : "";
  const displayStatus = (course.status ?? "IN_PROGRESS").replaceAll("_", " ");
  const progressClass =
    course.status === "COMPLETED"
      ? "third"
      : secondaryProgressCourseIds.has(course.id)
        ? "second"
        : "";

  return (
    <div className={`${styles.card} course-card-large`}>
      <Link
        to={getCourseLearningPath(course)}
        className={styles.cardLink}
        aria-label={`Continue learning ${course.title}`}
      />

      <div
        className={`${styles.image} course-image`}
        style={{ backgroundImage: `url(${courseImage})` }}
      >
        <div className={`${cx("badge", badgeClass)} course-badge ${badgeClass}`}>
          {displayStatus}
        </div>
      </div>

      <div className={`${styles.content} course-content`}>
        <h3>{course.title}</h3>
        {course.subtitle && <p>{course.subtitle}</p>}
        <p>{course.instructor}</p>

        <div className={`${styles.metaRow} course-meta-row`}>
          <div className={`${styles.meta} course-meta`}>
            <span>★ {Number(course.rating ?? 0).toFixed(1)}</span>
            <span>({formatReviewCount(course.reviewCount ?? 0)} reviews)</span>
            <Link
              to={getCourseReviewPath(course)}
              className={styles.rateButton}
              aria-label={`Rate ${course.title}`}
            >
              Rate
            </Link>
          </div>

          <Link
            to={getCourseGamePath(course)}
            className={`${styles.actionIcon} course-action-icon`}
            aria-label={`Open game for ${course.title}`}
          >
            <img src={gameIcon} alt="" className={`${styles.gameIcon} game-icon`} />
          </Link>
        </div>

        <CourseProgress
          learnedSections={course.learnedSections}
          progress={course.progress}
          progressClass={progressClass}
          totalSections={course.totalSections}
        />
      </div>
    </div>
  );
}
