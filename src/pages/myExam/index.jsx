import { useEffect, useMemo, useState } from "react";

import styles from "./MyExam.module.css";

import PageShell from "../../components/profileLayout/PageShell";
import { getMyExamPageData } from "../../api/exam/exam";

import ExamResultCard from "../../components/myExam/ExamResultCard";
import SubjectBreakdown from "../../components/myExam/SubjectBreakdown";
import RecentExams from "../../components/myExam/RecentExams";

export default function MyExam() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExamId, setSelectedExamId] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadMyExamData() {
      try {
        setLoading(true);
        setError(null);

        const myExamData = await getMyExamPageData();

        if (!ignore) {
          setData(myExamData);
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

    loadMyExamData();

    return () => {
      ignore = true;
    };
  }, []);

  const empty =
    !loading &&
    !error &&
    (!data ||
      !data.result ||
      (data.subjects?.length ?? 0) === 0 ||
      (data.recentExams?.length ?? 0) === 0);

  const selectedExam = useMemo(() => {
    if (!data?.recentExams?.length) {
      return null;
    }

    const activeExamId =
      selectedExamId ?? data.result?.id ?? data.recentExams[0]?.id;

    return data.recentExams.find((exam) => exam.id === activeExamId) ?? null;
  }, [data?.recentExams, data?.result?.id, selectedExamId]);

  const selectedResult = useMemo(() => {
    if (!data?.result) {
      return null;
    }

    if (!selectedExam) {
      return data.result;
    }

    return {
      ...data.result,
      id: selectedExam.id,
      title: selectedExam.courseName ?? selectedExam.title ?? data.result.title,
      score: selectedExam.score ?? data.result.score,
      totalScore: selectedExam.totalScore ?? data.result.totalScore ?? 100,
      status: (selectedExam.status ?? data.result.status).toUpperCase(),
      description:
        selectedExam.description ??
        `You scored ${selectedExam.score ?? data.result.score}% in this exam.`,
    };
  }, [data?.result, selectedExam]);

  const selectedSubjects =
    selectedExam?.subjects ??
    selectedExam?.subjectBreakdown ??
    selectedExam?.breakdown ??
    data?.subjects ??
    [];

  if (loading) {
    return (
      <PageShell>
        <main className={`${styles.myExamPage} ${styles.pageStatus}`}>
          Loading...
        </main>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <main className={`${styles.myExamPage} ${styles.pageStatus}`}>
          Failed to load exam data.
        </main>
      </PageShell>
    );
  }

  if (empty) {
    return (
      <PageShell>
        <main className={`${styles.myExamPage} ${styles.pageStatus}`}>
          No exam data found.
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main className={styles.myExamPage}>
        <ExamResultCard
          exams={data.recentExams}
          onSelectExam={setSelectedExamId}
          result={selectedResult}
          selectedExamId={selectedExamId}
        />

        <section className={styles.examGrid}>
          <SubjectBreakdown subjects={selectedSubjects} />
          <RecentExams exams={data.recentExams} />
        </section>
      </main>
    </PageShell>
  );
}
