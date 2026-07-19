import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import styles from "./Report.module.css";

import TopNav from "../../components/common/TopNav";
import Footer from "../../components/common/Footer";

import AIRecommendations from "../../components/report/AIRecommendations";
import ErrorDistribution from "../../components/report/ErrorDistribution";
import KnowledgeGap from "../../components/report/KnowledgeGap";
import ProficiencyLevel from "../../components/report/ProficiencyLevel";

import {
  getReportCourses,
  getReportData,
} from "../../api/report/report";

function normalizeCourseList(result) {
  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result?.records)) {
    return result.records;
  }

  if (Array.isArray(result?.list)) {
    return result.list;
  }

  if (Array.isArray(result?.courses)) {
    return result.courses;
  }

  return [];
}

export default function Report() {
  const navigate = useNavigate();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const menuRef = useRef(null);

  const [reportData, setReportData] =
    useState(null);

  const [error, setError] = useState("");

  const [courses, setCourses] =
    useState([]);

  const [
    selectedCourse,
    setSelectedCourse,
  ] = useState(null);

  const [courseOpen, setCourseOpen] =
    useState(false);

  const [
    coursesLoaded,
    setCoursesLoaded,
  ] = useState(false);

  const [
    reportLoading,
    setReportLoading,
  ] = useState(false);

  const fetchCourses = useCallback(async () => {
    try {
      setError("");
      setCoursesLoaded(false);
      setCourseOpen(false);

      const result =
        await getReportCourses();

      console.log(
        "getReportCourses response:",
        result
      );

      const courseList =
        normalizeCourseList(result);

      setCourses(courseList);

      if (courseList.length === 0) {
        setSelectedCourse(null);
        setReportData(null);
        return;
      }

      const urlCourseId =
        searchParams.get("courseId");

      const courseIdFromUrl =
        urlCourseId == null
          ? null
          : Number(urlCourseId);

      const matchedCourse =
        courseIdFromUrl != null &&
        !Number.isNaN(courseIdFromUrl)
          ? courseList.find(
              (course) =>
                Number(course.id) ===
                courseIdFromUrl
            )
          : null;

      const defaultCourse =
        matchedCourse || courseList[0];

      setSelectedCourse(defaultCourse);

      setSearchParams(
        {
          courseId: String(
            defaultCourse.id
          ),
        },
        {
          replace: true,
        }
      );
    } catch (err) {
      console.error(
        "Failed to load courses:",
        err
      );

      setCourses([]);
      setSelectedCourse(null);
      setReportData(null);

      setError(
        err?.message ||
          "Failed to load courses."
      );
    } finally {
      setCoursesLoaded(true);
    }
  }, [searchParams, setSearchParams]);

  const fetchReportData =
    useCallback(async () => {
      if (!selectedCourse?.id) {
        return;
      }

      try {
        setError("");
        setReportLoading(true);
        setReportData(null);

        const data = await getReportData(
          selectedCourse.id
        );

        console.log(
          "Selected course:",
          selectedCourse
        );

        console.log(
          "Report data:",
          data
        );

        if (!data) {
          setError(
            "Report data not found."
          );
          return;
        }

        setReportData(data);
      } catch (err) {
        console.error(
          "Failed to load report:",
          err
        );

        setError(
          err?.message ||
            "Failed to load analysis report."
        );
      } finally {
        setReportLoading(false);
      }
    }, [selectedCourse]);

  const handleCourseSelect = (course) => {
    if (
      Number(selectedCourse?.id) ===
      Number(course.id)
    ) {
      setCourseOpen(false);
      return;
    }

    setSelectedCourse(course);
    setCourseOpen(false);

    setSearchParams(
      {
        courseId: String(course.id),
      },
      {
        replace: true,
      }
    );
  };

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    if (selectedCourse?.id) {
      fetchReportData();
    }
  }, [
    selectedCourse?.id,
    fetchReportData,
  ]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target
        )
      ) {
        setCourseOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  if (error) {
    return (
      <>
        <TopNav />

        <div className={styles.reportError}>
          <h2>{error}</h2>

          <button
            type="button"
            className={styles.refreshBtn}
            onClick={() => {
              if (selectedCourse?.id) {
                fetchReportData();
              } else {
                fetchCourses();
              }
            }}
          >
            Try Again
          </button>
        </div>

        <Footer />
      </>
    );
  }

  if (!coursesLoaded) {
    return (
      <>
        <TopNav />

        <div className={styles.reportLoading}>
          <h2>Loading courses...</h2>
        </div>

        <Footer />
      </>
    );
  }

  if (courses.length === 0) {
    return (
      <>
        <TopNav />

        <div className={styles.emptyReport}>
          <div className={styles.emptyCard}>
            <div
              className={styles.emptyIcon}
            >
              📚
            </div>

            <h2>
              No Learning Records Yet
            </h2>

            <p>
              You have not started learning
              any courses yet.
            </p>

            <p>
              Start your first course and
              complete an assessment to
              receive personalized learning
              analytics and AI-powered
              recommendations.
            </p>

            <button
              type="button"
              className={
                styles.startLearningBtn
              }
              onClick={() =>
                navigate("/homepage")
              }
            >
              Start Learning
            </button>
          </div>
        </div>

        <Footer />
      </>
    );
  }

  if (
    reportLoading ||
    !reportData
  ) {
    return (
      <>
        <TopNav />

        <div className={styles.reportLoading}>
          <h2>
            Loading analysis report...
          </h2>
        </div>

        <Footer />
      </>
    );
  }

  return (
    <>
      <TopNav />

      <main className={styles.report}>
        <div
          className={styles.reportHeader}
        >
          <div>
            <h1>
              Intelligent Assessment Report
            </h1>

            <p>
              Personalized analysis of your
              recent{" "}
              {selectedCourse?.name ||
                "course"}{" "}
              assessment.
            </p>
          </div>

          <div
            ref={menuRef}
            className={styles.courseSelect}
          >
            <button
              type="button"
              className={
                styles.courseSelectBtn
              }
              aria-haspopup="listbox"
              aria-expanded={courseOpen}
              onClick={() =>
                setCourseOpen(
                  (open) => !open
                )
              }
            >
              <span>
                {selectedCourse?.name ||
                  "Select course"}
              </span>

              <span aria-hidden="true">
                {courseOpen ? "▲" : "▼"}
              </span>
            </button>

            {courseOpen && (
              <div
                className={
                  styles.courseMenu
                }
                role="listbox"
              >
                {courses.map((course) => {
                  const isSelected =
                    Number(
                      selectedCourse?.id
                    ) === Number(course.id);

                  return (
                    <button
                      type="button"
                      role="option"
                      aria-selected={
                        isSelected
                      }
                      key={course.id}
                      className={
                        isSelected
                          ? styles.activeCourse
                          : ""
                      }
                      onClick={() =>
                        handleCourseSelect(
                          course
                        )
                      }
                    >
                      {isSelected
                        ? "✓ "
                        : ""}
                      {course.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className={styles.reportGrid}>
          <div className={styles.reportLeft}>
            <ProficiencyLevel
              data={
                reportData.proficiency
              }
            />

            <ErrorDistribution
              data={reportData.errors || []}
            />
          </div>

          <div
            className={styles.reportRight}
          >
            <KnowledgeGap
              data={
                reportData.knowledgeGap ||
                []
              }
            />

            <AIRecommendations
              data={
                reportData.aiSuggestion
              }
            />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}