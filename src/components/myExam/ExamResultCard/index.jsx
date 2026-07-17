import { useState } from "react";

import styles from "./ExamResultCard.module.css";

export default function ExamResultCard({
  exams = [],
  onSelectExam,
  result = {
    id: null,
    title: "No Exam Result Yet",
    score: 0,
    totalScore: 100,
    status: "NO DATA",
    description: "Complete an exam to see your result here.",
  },
  selectedExamId,
}) {
  const [downloaded, setDownloaded] = useState(false);
  const [shareStatus, setShareStatus] = useState("Share Result");
  const safeScore = Number(result.score) || 0;
  const safeTotalScore = Number(result.totalScore) > 0 ? Number(result.totalScore) : 100;
  const scoreAngle = `${(safeScore / safeTotalScore) * 360}deg`;
  const activeExamId = selectedExamId ?? result.id ?? exams[0]?.id ?? null;
  const activeExamValue = activeExamId === null ? "" : String(activeExamId);
  const shareSucceeded =
    shareStatus === "Shared" || shareStatus === "Copied Link";
  const shareFailed = shareStatus === "Share Failed";

  const handleDownload = () => {
    const certificateText = [
      result.title,
      "",
      `Status: ${result.status}`,
      `Score: ${result.score}/${result.totalScore}`,
      "",
      result.description,
    ].join("\n");
    const fileName = `${result.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`;
    const certificateFile = new Blob([certificateText], {
      type: "text/plain;charset=utf-8",
    });
    const certificateUrl = URL.createObjectURL(certificateFile);
    const link = document.createElement("a");

    link.href = certificateUrl;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(certificateUrl);

    setDownloaded(true);
    window.setTimeout(() => {
      setDownloaded(false);
    }, 1800);
  };

  const handleShare = async () => {
    const shareData = {
      title: result.title,
      text: `I passed ${result.title} with a score of ${result.score}/${result.totalScore}.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus("Shared");
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(
          `${shareData.text} ${shareData.url}`
        );
        setShareStatus("Copied Link");
      } else {
        const shareText = `${shareData.text} ${shareData.url}`;
        const textArea = document.createElement("textarea");

        textArea.value = shareText;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setShareStatus("Copied Link");
      }

      window.setTimeout(() => {
        setShareStatus("Share Result");
      }, 1800);
    } catch (error) {
      if (error.name !== "AbortError") {
        setShareStatus("Share Failed");
        window.setTimeout(() => {
          setShareStatus("Share Result");
        }, 1800);
      }
    }
  };

  return (
    <section className={styles.resultCard}>
      <div className={styles.scoreCircle} style={{ "--score-angle": scoreAngle }}>
        <div>
          <strong>{safeScore}</strong>
          <span>/{safeTotalScore}</span>
          <p>SCORE</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.titleRow}>
          <span className={styles.badge}>{result.status}</span>
          <h1>{result.title}</h1>
          {exams.length > 0 && (
            <select
              className={styles.courseSelect}
              value={activeExamValue}
              aria-label="Choose exam course"
              onChange={(event) => {
                const nextExam = exams.find(
                  (exam) => String(exam.id) === event.target.value
                );

                if (nextExam) {
                  onSelectExam?.(nextExam.id);
                }
              }}
            >
              {exams.map((exam) => (
                <option key={exam.id} value={String(exam.id)}>
                  {exam.courseName}
                </option>
              ))}
            </select>
          )}
        </div>

        <p className={styles.description}>{result.description}</p>

        <div className={styles.actions}>
          <button
            className={`${styles.primaryButton} ${
              downloaded ? styles.downloadedButton : ""
            }`}
            type="button"
            onClick={handleDownload}
          >
            {downloaded ? "Downloaded" : "Download Certificate"}
          </button>
          <button
            className={`${styles.secondaryButton} ${
              shareSucceeded ? styles.sharedButton : ""
            } ${shareFailed ? styles.failedButton : ""}`}
            type="button"
            onClick={handleShare}
          >
            {shareStatus}
          </button>
        </div>
      </div>
    </section>
  );
}
