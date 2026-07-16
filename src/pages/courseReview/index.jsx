import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getCourseReviews,
  getLearningCourses,
  submitCourseReview,
} from "../../api/course/course";
import { showToast } from "../../components/common/toast";
import PageShell from "../../components/profileLayout/PageShell";
import styles from "./CourseReview.module.css";

const activeStar = String.fromCharCode(9733);
const emptyStar = String.fromCharCode(9734);

function renderStars(rating) {
  return Array.from({ length: 5 }, (_, index) =>
    index < rating ? activeStar : emptyStar
  ).join("");
}

export default function CourseReview() {
  const { courseId } = useParams();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [recentReviews, setRecentReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [realCourse, setRealCourse] = useState(null);

  const course = realCourse;

  useEffect(() => {
    if (!courseId) {
      return;
    }

    let ignore = false;

    async function loadCourse() {
      try {
        const data = await getLearningCourses("ALL");
        const matchedCourse = (data?.courses ?? []).find(
          (item) => String(item.id) === courseId
        );

        if (!ignore) setRealCourse(matchedCourse ?? null);
      } catch {
        if (!ignore) showToast("Could not load course details.", "error");
      }
    }

    loadCourse();

    return () => {
      ignore = true;
    };
  }, [courseId]);

  const loadReviews = useCallback(async () => {
    const reviews = await getCourseReviews(courseId);
    setRecentReviews(Array.isArray(reviews) ? reviews : []);
  }, [courseId]);

  useEffect(() => {
    if (!courseId) {
      return;
    }

    let ignore = false;

    async function loadReviews() {
      try {
        setReviewsLoading(true);
        const reviews = await getCourseReviews(courseId);
        if (!ignore) setRecentReviews(Array.isArray(reviews) ? reviews : []);
      } catch {
        if (!ignore) {
          showToast("Could not load recent reviews.", "error");
        }
      } finally {
        if (!ignore) {
          setReviewsLoading(false);
        }
      }
    }

    loadReviews();

    return () => {
      ignore = true;
    };
  }, [courseId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedComment = comment.trim();

    if (!trimmedComment) {
      showToast("Please write a comment before submitting your review.", "warning");
      return;
    }

    try {
      setIsSubmitting(true);
      await submitCourseReview(courseId, {
        rating,
        comment: trimmedComment,
      });
      await loadReviews();
      setComment("");
      showToast("Review submitted successfully.", "success");
    } catch {
      showToast("Could not submit review. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!courseId) {
    return (
      <PageShell>
        <main className={styles.reviewPage}>
          <section className={styles.emptyState}>
            <Link to="/courses" className={styles.backLink}>
              Back to Courses
            </Link>
            <h1>Course not found</h1>
          </section>
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main className={styles.reviewPage}>
        <section className={styles.reviewLayout}>
          <div className={styles.formPanel}>
            <Link to="/courses" className={styles.backLink}>
              Back to Courses
            </Link>

            <h1>{course?.title ?? "Course Review"}</h1>
            {course?.instructor && (
              <p className={styles.instructor}>{course.instructor}</p>
            )}

            <form onSubmit={handleSubmit} className={styles.reviewForm}>
              <fieldset className={styles.ratingGroup}>
                <legend>Rating</legend>
                <div className={styles.stars} aria-label={`${rating} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={star <= rating ? styles.starActive : styles.star}
                      onClick={() => setRating(star)}
                      aria-label={`${star} star${star === 1 ? "" : "s"}`}
                    >
                      {activeStar}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className={styles.commentLabel} htmlFor="review-comment">
                Comment
              </label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Share what stood out about this course..."
                rows={6}
              />

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>

          <aside className={styles.reviewsPanel}>
            <div className={styles.reviewsHeader}>
              <h2>Recent Reviews</h2>
            </div>

            <div className={styles.reviewList}>
              {reviewsLoading && (
                <p className={styles.reviewStatus}>Loading reviews...</p>
              )}

              {!reviewsLoading && recentReviews.length === 0 && (
                <p className={styles.reviewStatus}>No reviews yet.</p>
              )}

              {!reviewsLoading &&
                recentReviews.map((review) => (
                  <article key={review.id} className={styles.reviewItem}>
                    <div>
                      <strong>{review.username || "Anonymous User"}</strong>
                      <span>{renderStars(review.rating)}</span>
                    </div>
                    <p>{review.comment}</p>
                  </article>
                ))}
            </div>
          </aside>
        </section>
      </main>
    </PageShell>
  );
}
