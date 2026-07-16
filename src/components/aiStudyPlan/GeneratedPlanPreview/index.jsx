import styles from "./GeneratedPlanPreview.module.css";

export default function GeneratedPlanPreview({
  onCreatePlan,
  plan,
  isGenerating,
  generationError,
  canGenerate,
}) {
  return (
    <aside className={styles.previewCard}>
      <div className={styles.header}>
        <h2>Generated Plan Preview</h2>
      </div>

      {plan ? (
        <div className={styles.generatedPlan}>
          <h3>Your AI Study Plan</h3>
          <p>{plan}</p>
        </div>
      ) : (
        <div className={styles.generatedPlan}>
          <p>Provide your goal, level, available time, and weakness in the chat to generate your study plan.</p>
        </div>
      )}

      {generationError && (
        <p className={styles.errorMessage} role="alert">
          {generationError}
        </p>
      )}

      <button
        type="button"
        disabled={!canGenerate || isGenerating}
        onClick={onCreatePlan}
      >
        {isGenerating
          ? "Generating Plan..."
          : plan
            ? "Regenerate My Study Plan"
            : "Create My Study Plan"}
      </button>
    </aside>
  );
}
