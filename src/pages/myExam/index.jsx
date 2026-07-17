import { useEffect, useMemo, useState } from "react";

import styles from "./MyExam.module.css";

import PageShell from "../../components/profileLayout/PageShell";
import { getMyExamPageData } from "../../api/exam/exam";

import ExamResultCard from "../../components/myExam/ExamResultCard";
import SubjectBreakdown from "../../components/myExam/SubjectBreakdown";
import RecentExams from "../../components/myExam/RecentExams";

const emptyExamData = {
  result: {
    id: null,
    title: "No Exam Result Yet",
    score: 0,
    totalScore: 100,
    status: "NO DATA",
    description: "Complete an exam to see your result, certificate, and detailed performance here.",
  },
  subjects: [],
  recentExams: [],
};

function normalizeExamData(myExamData) {
  return {
    ...emptyExamData,
    ...(myExamData ?? {}),
    result: {
      ...emptyExamData.result,
      ...(myExamData?.result ?? {}),
    },
    subjects: Array.isArray(myExamData?.subjects) ? myExamData.subjects : [],
    recentExams: Array.isArray(myExamData?.recentExams)
      ? myExamData.recentExams
      : [],
  };
}

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
          setData(normalizeExamData(myExamData));
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

  const examData = useMemo(() => normalizeExamData(data), [data]);

  const selectedExam = useMemo(() => {
    if (!examData.recentExams.length) {
      return null;
    }

    const activeExamId =
      selectedExamId ?? examData.result?.id ?? examData.recentExams[0]?.id;

    return examData.recentExams.find((exam) => exam.id === activeExamId) ?? null;
  }, [examData.recentExams, examData.result?.id, selectedExamId]);

  const selectedResult = useMemo(() => {
    if (!selectedExam) {
      return examData.result;
    }

    return {
      ...examData.result,
      id: selectedExam.id,
      title: selectedExam.courseName ?? selectedExam.title ?? examData.result.title,
      score: selectedExam.score ?? examData.result.score,
      totalScore: selectedExam.totalScore ?? examData.result.totalScore ?? 100,
      status: (selectedExam.status ?? examData.result.status).toUpperCase(),
      description:
        selectedExam.description ??
        `You scored ${selectedExam.score ?? examData.result.score}% in this exam.`,
    };
  }, [examData.result, selectedExam]);

  const selectedSubjects =
    selectedExam?.subjects ??
    selectedExam?.subjectBreakdown ??
    selectedExam?.breakdown ??
    examData.subjects ??
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

  return (
    <PageShell>
      <main className={styles.myExamPage}>
        <ExamResultCard
          exams={examData.recentExams}
          onSelectExam={setSelectedExamId}
          result={selectedResult}
          selectedExamId={selectedExamId}
        />

        <section className={styles.examGrid}>
          <SubjectBreakdown subjects={selectedSubjects} />
          <RecentExams exams={examData.recentExams} />
        </section>
      </main>
    </PageShell>
  );
}
